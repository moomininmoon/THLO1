import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// [1] Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyCzcdf8QBZFTtKh6vTM2f_Awb9Vncb3EtU",
    authDomain: "tanhalaw-e5d06.firebaseapp.com",
    projectId: "tanhalaw-e5d06",
    storageBucket: "tanhalaw-e5d06.appspot.com", // 이미지 오류 방지
    messagingSenderId: "882787510142",
    appId: "1:882787510142:web:36f4b2342ed9a2dfcd752f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const MAIL_URL = "https://script.google.com/macros/s/AKfycbw_LmMmLvQv6MhD6438LLjRGV9MIo67A2a5789UeWTslD56Db7fE6_S3J5npHn2gV-q/exec";
let isAdmin = false;

// 원본 스크롤 및 비디오 로직 보존
window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (window.scrollY > 50) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
});

let lastWidth = window.innerWidth;
window.addEventListener('resize', () => {
    const currentWidth = window.innerWidth;
    const video = document.getElementById('main-video');
    if ((lastWidth <= 768 && currentWidth > 768) || (lastWidth > 768 && currentWidth <= 768)) {
        if (video) video.load();
    }
    lastWidth = currentWidth;
});

// [2] 렌더링 붕괴를 막는 새로운 모달 토글 방식 (Flexbox 호환)
window.toggleModal = (id) => {
    const el = document.getElementById(id);
    if (el) {
        el.classList.toggle('show');
    }
};

// [3] 권한 관리 및 로그아웃 버튼 (안정성 강화)
onAuthStateChanged(auth, (user) => {
    const authBtnContainer = document.getElementById('auth-menu');
    const adminSection = document.getElementById('admin-only-section');

    if (user && user.email === "tanhalaw1@gmail.com") {
        isAdmin = true;
        authBtnContainer.innerHTML = `<a href="javascript:void(0)" id="btn-logout">LOGOUT</a>`;
        // 로그아웃 이벤트를 명확히 바인딩
        document.getElementById('btn-logout').addEventListener('click', () => {
            signOut(auth).then(() => {
                alert("정상적으로 로그아웃 되었습니다.");
                location.reload();
            });
        });
        if(adminSection) adminSection.style.display = "block";
    } else {
        isAdmin = false;
        authBtnContainer.innerHTML = `<a href="javascript:void(0)" onclick="toggleModal('login-modal')">LOGIN</a>`;
        if(adminSection) adminSection.style.display = "none";
    }
    loadCases(); 
});

// [4] 상담 문의 제출 (에러 방지 로직 보강)
document.getElementById('consultation-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!document.getElementById('privacy-check').checked) {
        return alert("개인정보 수집 및 이용에 동의해 주셔야 합니다.");
    }

    const btn = e.target.querySelector('.submit-btn');
    btn.innerText = "접수 내역 전송 중...";
    btn.disabled = true;

    const formData = {
        name: document.getElementById('user-name').value,
        phone: document.getElementById('user-phone').value,
        email: document.getElementById('user-email').value,
        type: document.getElementById('consult-type').value,
        message: document.getElementById('user-message').value
    };

    try {
        await addDoc(collection(db, "consultations"), { ...formData, timestamp: new Date() });
        await fetch(MAIL_URL, { 
            method: "POST", 
            body: JSON.stringify(formData), 
            headers: { "Content-Type": "text/plain;charset=utf-8" } 
        }).catch(err => console.log("이메일 알림 전송 실패(데이터는 저장됨):", err));

        alert("성공적으로 상담이 접수되었습니다. 확인 후 연락드리겠습니다.");
        e.target.reset();
    } catch (err) { 
        alert("시스템 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."); 
    } finally { 
        btn.innerText = "온라인 상담 신청하기"; 
        btn.disabled = false; 
    }
});

// [5] 성공사례 불러오기 (UI 디자인 규격 준수)
async function loadCases() {
    const q = query(collection(db, "cases"), orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    const list = document.getElementById('cases-list');
    if (!list) return;

    list.innerHTML = "";
    snap.forEach(dSnapshot => {
        const d = dSnapshot.data();
        const docId = dSnapshot.id;
        
        const imgHtml = d.imageUrl ? `<img src="${d.imageUrl}" class="case-img" alt="사례 이미지">` : '';
        const delBtnHtml = isAdmin ? `<button class="btn-delete" onclick="deleteCase('${docId}')">이 게시물 삭제하기</button>` : '';
        
        list.innerHTML += `
            <div class="case-card">
                ${imgHtml}
                <div class="case-body">
                    <h3>${d.title}</h3>
                    <p>${d.content.replace(/\n/g, '<br>')}</p>
                    ${delBtnHtml}
                </div>
            </div>`;
    });
}

// 삭제 함수 바인딩
window.deleteCase = async (id) => {
    if(confirm("이 성공사례를 영구적으로 삭제하시겠습니까?")) {
        try {
            await deleteDoc(doc(db, "cases", id));
            alert("정상적으로 삭제되었습니다.");
            loadCases();
        } catch(err) { alert("삭제 중 오류가 발생했습니다."); }
    }
};

// [6] 성공사례 업로드 (Storage 통신)
document.getElementById('post-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerText = "이미지 및 데이터 업로드 중...";
    btn.disabled = true;

    const file = document.getElementById('post-image').files[0];
    let imageUrl = null;

    try {
        if (file) {
            const sRef = ref(storage, 'cases/' + Date.now() + '_' + file.name);
            await uploadBytes(sRef, file);
            imageUrl = await getDownloadURL(sRef);
        }

        await addDoc(collection(db, "cases"), {
            title: document.getElementById('post-title').value,
            content: document.getElementById('post-content').value,
            imageUrl: imageUrl,
            timestamp: new Date()
        });

        alert("새로운 성공사례가 홈페이지에 반영되었습니다.");
        toggleModal('post-modal');
        e.target.reset(); 
        loadCases(); 
    } catch(err) { 
        alert("업로드 실패: Firebase 저장소 권한(Storage Rules) 설정을 확인해 주세요."); 
    } finally { 
        btn.innerText = "게시물 등록 완료"; 
        btn.disabled = false; 
    }
});

// [7] 관리자 로그인 폼 제출
document.getElementById('auth-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await signInWithEmailAndPassword(
            auth, 
            document.getElementById('auth-email').value, 
            document.getElementById('auth-password').value
        );
        toggleModal('login-modal');
    } catch (err) { alert("아이디 또는 비밀번호가 일치하지 않습니다."); }
});