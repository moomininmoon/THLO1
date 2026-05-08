/* =========================================================
   TANHA LAW OFFICE — script.js
   ========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getFirestore, collection, addDoc, getDocs, query, orderBy, where,
    deleteDoc, doc, updateDoc, serverTimestamp
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

/** 전화번호를 숫자만 남긴 정규화 형태로 (010-1234-5678 / 010 1234 5678 → 01012345678) */
function normalizePhone(str = "") {
    return String(str).replace(/[^0-9]/g, "");
}

/** 접수번호 생성: TH-YYYYMMDD-XXXX (4자리 랜덤) */
function generateReceiptNumber() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const rand = String(Math.floor(1000 + Math.random() * 9000));
    return `TH-${yyyy}${mm}${dd}-${rand}`;
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
    const adminMenu    = $("#admin-menu");
    const adminSection = $("#admin-only-section");
    const isAdmin      = user && user.email === ADMIN_EMAIL;

    if (authMenu) {
        authMenu.innerHTML = isAdmin
            ? `<a href="#" data-action="logout">Logout</a>`
            : `<a href="#" data-action="open-login">Login</a>`;
    }
    if (adminMenu) adminMenu.hidden = !isAdmin;
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
            const receiptNumber = generateReceiptNumber();
            const phoneNormalized = normalizePhone(phone);

            await addDoc(collection(db, "consultations"), {
                name, phone, phoneNormalized, email, type, message,
                receiptNumber,
                done: false,
                timestamp: serverTimestamp()
            });

            consultForm.reset();

            // 접수번호 안내 모달
            const numEl = $("#receipt-number");
            if (numEl) numEl.textContent = receiptNumber;
            openModal("receipt-modal");
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

/* ---------- Consultations (admin only) ---------- */
function formatDate(ts) {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    if (isNaN(d.getTime())) return "—";
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${yy}.${mm}.${dd} ${hh}:${mi}`;
}

async function loadConsultations() {
    const list  = $("#consults-list");
    const count = $("#consults-count");
    if (!list) return;

    if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) {
        list.innerHTML = `<div class="consults-empty">관리자만 조회할 수 있습니다.</div>`;
        if (count) count.textContent = "0";
        return;
    }

    list.innerHTML = `<div class="consults-empty">불러오는 중입니다.</div>`;

    try {
        const q = query(collection(db, "consultations"), orderBy("timestamp", "desc"));
        const snap = await getDocs(q);

        if (snap.empty) {
            list.innerHTML = `<div class="consults-empty">접수된 상담이 없습니다.</div>`;
            if (count) count.textContent = "0";
            return;
        }

        if (count) count.textContent = snap.size;

        const html = [];
        snap.forEach((docSnap) => {
            const d  = docSnap.data();
            const id = docSnap.id;

            const name    = escapeHTML(d.name    || "(이름 없음)");
            const phone   = escapeHTML(d.phone   || "");
            const email   = escapeHTML(d.email   || "");
            const type    = escapeHTML(d.type    || "기타");
            const message = escapeHTML(d.message || "");
            const date    = escapeHTML(formatDate(d.timestamp));
            const isDone  = !!d.done;

            const phoneCell = phone
                ? `<a href="tel:${phone.replace(/[^0-9+]/g, '')}">${phone}</a>`
                : "—";
            const emailCell = email
                ? `<a href="mailto:${email}">${email}</a>`
                : "—";

            html.push(`
                <div class="consult-item ${isDone ? 'is-done' : ''}" data-id="${escapeHTML(id)}">
                    <div class="consult-summary" data-action="toggle-consult">
                        <span class="consult-date">${date}</span>
                        <span class="consult-name">${name}</span>
                        <span class="consult-type">${type}</span>
                        <span class="consult-toggle" aria-hidden="true">▾</span>
                    </div>
                    <div class="consult-detail">
                        <dl class="consult-meta">
                            <dt>연락처</dt><dd>${phoneCell}</dd>
                            <dt>이메일</dt><dd>${emailCell}</dd>
                        </dl>
                        <div class="consult-message">${message}</div>
                        <div class="consult-actions">
                            <button class="btn-done ${isDone ? 'is-active' : ''}"
                                    data-action="toggle-done" data-id="${escapeHTML(id)}">
                                ${isDone ? '처리완료 취소' : '처리완료'}
                            </button>
                            <button class="btn-delete"
                                    data-action="delete-consult" data-id="${escapeHTML(id)}">
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            `);
        });

        list.innerHTML = html.join("");
    } catch (err) {
        console.error(err);
        list.innerHTML = `<div class="consults-empty">상담을 불러오는 데 실패했습니다.<br>${escapeHTML(err?.message || '')}</div>`;
    }
}

async function toggleConsultDone(id, currentEl) {
    if (!id) return;
    const isCurrentlyDone = currentEl.classList.contains("is-active");
    try {
        await updateDoc(doc(db, "consultations", id), { done: !isCurrentlyDone });
        await loadConsultations();
    } catch (err) {
        console.error(err);
        alert("상태 변경에 실패했습니다.");
    }
}

async function deleteConsult(id) {
    if (!id) return;
    if (!confirm("이 상담 내역을 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.")) return;
    try {
        await deleteDoc(doc(db, "consultations", id));
        await loadConsultations();
    } catch (err) {
        console.error(err);
        alert("삭제에 실패했습니다.");
    }
}

/* ---------- My-lookup (신청자 본인 조회) ---------- */
const mylookupForm = $("#mylookup-form");
if (mylookupForm) {
    mylookupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = mylookupForm.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        const resultBox = $("#mylookup-result");

        const name  = $("#mylookup-name").value.trim();
        const phone = normalizePhone($("#mylookup-phone").value);

        if (!name || !phone) {
            alert("성함과 연락처를 모두 입력해주세요.");
            return;
        }

        btn.disabled = true;
        btn.textContent = "조회 중";
        if (resultBox) resultBox.innerHTML = "";

        try {
            const q = query(
                collection(db, "consultations"),
                where("name", "==", name),
                where("phoneNormalized", "==", phone)
            );
            const snap = await getDocs(q);

            if (!resultBox) return;

            if (snap.empty) {
                resultBox.innerHTML = `
                    <div class="mylookup-message">
                        일치하는 상담 내역이 없습니다.<br>
                        성함과 연락처를 다시 확인해주세요.
                    </div>`;
                return;
            }

            // 최신순 정렬 (서버측 orderBy 안 씀 — 인덱스 불필요하도록)
            const items = [];
            snap.forEach(s => items.push({ id: s.id, ...s.data() }));
            items.sort((a, b) => {
                const ta = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
                const tb = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
                return tb - ta;
            });

            const html = items.map(d => {
                const num    = escapeHTML(d.receiptNumber || "(번호 없음)");
                const date   = escapeHTML(formatDate(d.timestamp));
                const type   = escapeHTML(d.type || "기타");
                const msg    = nl2br(d.message || "");
                const isDone = !!d.done;
                const status = isDone ? "처리 완료" : "접수됨";
                const statusCls = isDone ? "is-done" : "";

                return `
                    <article class="mylookup-card">
                        <header class="mylookup-card-head">
                            <span class="mylookup-card-num">${num}</span>
                            <span class="mylookup-card-date">${date}</span>
                            <span class="mylookup-card-status ${statusCls}">${status}</span>
                        </header>
                        <p class="mylookup-card-type">상담 분야 — ${type}</p>
                        <p class="mylookup-card-msg">${msg}</p>
                    </article>
                `;
            }).join("");

            resultBox.innerHTML = html;
        } catch (err) {
            console.error(err);
            if (resultBox) {
                resultBox.innerHTML = `
                    <div class="mylookup-message">
                        조회 중 오류가 발생했습니다.<br>
                        ${escapeHTML(err?.message || '')}
                    </div>`;
            }
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
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
        case "open-consults":
            e.preventDefault();
            openModal("consults-modal");
            await loadConsultations();
            break;
        case "open-mylookup":
            e.preventDefault();
            openModal("mylookup-modal");
            // 모달이 열릴 때 폼/결과 초기화
            $("#mylookup-form")?.reset();
            const r = $("#mylookup-result");
            if (r) r.innerHTML = "";
            break;
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
        case "toggle-consult": {
            // 상담 항목 펼치기/접기 (요약 영역 어디든 클릭 시)
            const item = target.closest(".consult-item");
            if (item) item.classList.toggle("is-open");
            break;
        }
        case "toggle-done":
            e.preventDefault();
            e.stopPropagation();
            await toggleConsultDone(target.dataset.id, target);
            break;
        case "delete-consult":
            e.preventDefault();
            e.stopPropagation();
            await deleteConsult(target.dataset.id);
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
