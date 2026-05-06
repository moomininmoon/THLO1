/* =========================================================
   TANHA LAW OFFICE — script.js
   ========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getFirestore, collection, addDoc, getDocs, query, orderBy,
    deleteDoc, doc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
    getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

/* ---------- Firebase ---------- */
const firebaseConfig = {
    apiKey: "AIzaSyCzcdf8QBZFTtKh6vTM2f_Awb9Vncb3EtU",
    authDomain: "tanhalaw-e5d06.firebaseapp.com",
    projectId: "tanhalaw-e5d06",
    storageBucket: "tanhalaw-e5d06.appspot.com",
    messagingSenderId: "882787510142",
    appId: "1:882787510142:web:36f4b2342ed9a2dfcd752f"
};
const ADMIN_EMAIL = "tanhalaw1@gmail.com";

const app     = initializeApp(firebaseConfig);
const auth    = getAuth(app);
const db      = getFirestore(app);
const storage = getStorage(app);

/* ---------- Helpers ---------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function escapeHTML(str = "") {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
function nl2br(str = "") {
    return escapeHTML(str).replace(/\n/g, "<br>");
}

/* ---------- Modal ---------- */
function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
}
function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
}
function closeAllModals() {
    $$(".modal.is-open").forEach(m => closeModal(m.id));
}
window.toggleModal = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.contains("is-open") ? closeModal(id) : openModal(id);
};

/* ---------- Auth state ---------- */
onAuthStateChanged(auth, (user) => {
    const authMenu     = $("#auth-menu");
    const adminSection = $("#admin-only-section");
    const isAdmin      = user && user.email === ADMIN_EMAIL;

    if (authMenu) {
        authMenu.innerHTML = isAdmin
            ? `<a href="#" data-action="logout">Logout</a>`
            : `<a href="#" data-action="open-login">Login</a>`;
    }
    if (adminSection) adminSection.hidden = !isAdmin;

    loadCases();
});

/* ---------- Consultation ---------- */
const consultForm = $("#consultation-form");
if (consultForm) {
    consultForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = consultForm.querySelector('button[type="submit"]');
        const originalText = btn.textContent;

        const name    = $("#user-name").value.trim();
        const phone   = $("#user-phone").value.trim();
        const email   = $("#user-email").value.trim();
        const type    = $("#consult-type").value;
        const message = $("#user-message").value.trim();
        const agreed  = $("#privacy-check").checked;

        if (!name || !phone || !email || !message) {
            alert("모든 필수 항목을 입력해주세요.");
            return;
        }
        if (!agreed) {
            alert("개인정보 수집 및 이용에 동의해주세요.");
            return;
        }

        btn.disabled = true;
        btn.textContent = "접수 중";

        try {
            await addDoc(collection(db, "consultations"), {
                name, phone, email, type, message,
                timestamp: serverTimestamp()
            });
            alert("상담 신청이 접수되었습니다.\n빠른 시일 내에 회신드리겠습니다.");
            consultForm.reset();
        } catch (err) {
            console.error(err);
            alert("접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
}

/* ---------- Cases ---------- */
async function loadCases() {
    const list = $("#cases-list");
    if (!list) return;

    try {
        const q = query(collection(db, "cases"), orderBy("timestamp", "desc"));
        const snap = await getDocs(q);

        if (snap.empty) {
            list.innerHTML = `<div class="cases-empty">아직 등록된 사례가 없습니다.</div>`;
            return;
        }

        const isAdmin = auth.currentUser && auth.currentUser.email === ADMIN_EMAIL;
        const html = [];

        snap.forEach((docSnap) => {
            const d  = docSnap.data();
            const id = docSnap.id;

            const imgHtml = d.imageUrl
                ? `<img src="${escapeHTML(d.imageUrl)}" alt="${escapeHTML(d.title || '')}" class="case-img" loading="lazy">`
                : "";

            const delHtml = isAdmin
                ? `<div class="case-actions">
                       <button class="delete-btn" data-action="delete-case" data-id="${escapeHTML(id)}">삭제</button>
                   </div>`
                : "";

            html.push(`
                <article class="case-card">
                    ${imgHtml}
                    <div class="case-body">
                        <h3>${escapeHTML(d.title || "(제목 없음)")}</h3>
                        <p>${nl2br(d.content || "")}</p>
                        ${delHtml}
                    </div>
                </article>
            `);
        });

        list.innerHTML = html.join("");
    } catch (err) {
        console.error(err);
        list.innerHTML = `<div class="cases-empty">사례를 불러오는 데 실패했습니다.</div>`;
    }
}

async function deleteCase(id) {
    if (!id) return;
    if (!confirm("이 사례를 삭제하시겠습니까?")) return;
    try {
        await deleteDoc(doc(db, "cases", id));
        await loadCases();
    } catch (err) {
        console.error(err);
        alert("삭제에 실패했습니다.");
    }
}

/* ---------- Post ---------- */
const postForm = $("#post-form");
if (postForm) {
    postForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = postForm.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = "업로드 중";

        const file    = $("#post-image")?.files?.[0] || null;
        const title   = $("#post-title-input").value.trim();
        const content = $("#post-content").value.trim();

        if (!title || !content) {
            alert("제목과 내용을 모두 입력해주세요.");
            btn.disabled = false; btn.textContent = originalText;
            return;
        }

        try {
            let imageUrl = null;
            if (file) {
                const safeName = file.name.replace(/[^\w.\-]/g, "_");
                const sRef = ref(storage, `cases/${Date.now()}_${safeName}`);
                await uploadBytes(sRef, file);
                imageUrl = await getDownloadURL(sRef);
            }

            await addDoc(collection(db, "cases"), {
                title, content, imageUrl,
                timestamp: serverTimestamp()
            });

            alert("성공사례가 등록되었습니다.");
            postForm.reset();
            closeModal("post-modal");
            await loadCases();
        } catch (err) {
            console.error(err);
            alert("등록에 실패했습니다: " + (err?.message || ""));
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
}

/* ---------- Login ---------- */
const authForm = $("#auth-form");
if (authForm) {
    authForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = authForm.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = "로그인 중";

        const email    = $("#auth-email").value.trim();
        const password = $("#auth-password").value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            authForm.reset();
            closeModal("login-modal");
        } catch (err) {
            console.error(err);
            alert("로그인에 실패했습니다.");
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
}

/* ---------- Click delegation ---------- */
document.addEventListener("click", async (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;

    switch (action) {
        case "open-login":
            e.preventDefault(); openModal("login-modal"); break;
        case "open-post":
            e.preventDefault(); openModal("post-modal"); break;
        case "close-modal": {
            e.preventDefault();
            const id = target.dataset.target;
            if (id) closeModal(id);
            break;
        }
        case "logout":
            e.preventDefault();
            try { await signOut(auth); alert("로그아웃 되었습니다."); }
            catch (err) { console.error(err); }
            break;
        case "delete-case":
            e.preventDefault();
            await deleteCase(target.dataset.id);
            break;
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllModals();
});

/* ---------- Header scroll state ---------- */
const header = $("#main-header");
let ticking = false;
window.addEventListener("scroll", () => {
    if (ticking) return;
    requestAnimationFrame(() => {
        header?.classList.toggle("scrolled", window.scrollY > 60);
        ticking = false;
    });
    ticking = true;
}, { passive: true });

/* ---------- Mobile nav ---------- */
const navToggle = $(".nav-toggle");
const navLinks  = $(".nav-links");
navToggle?.addEventListener("click", () => {
    navToggle.classList.toggle("is-open");
    navLinks.classList.toggle("is-open");
});
navLinks?.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
        navToggle?.classList.remove("is-open");
        navLinks?.classList.remove("is-open");
    }
});

/* ---------- Reveal on scroll ---------- */
const revealTargets = [
    ".section-header",
    ".profile-intro",
    ".profile-content",
    ".form-card",
    ".cases-grid",
    ".contact-list"
];
$$(revealTargets.join(",")).forEach(el => el.classList.add("reveal"));

const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
        }
    });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

$$(".reveal").forEach(el => io.observe(el));

/* ---------- Smooth scroll with header offset ---------- */
document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute("href");
    if (href.length <= 1) return;
    const t = document.querySelector(href);
    if (!t) return;
    e.preventDefault();
    const headerH = header?.offsetHeight || 76;
    window.scrollTo({
        top: t.getBoundingClientRect().top + window.scrollY - headerH + 1,
        behavior: "smooth"
    });
});
