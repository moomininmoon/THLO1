/* =========================================================
   TANHA LAW OFFICE — script.js
   ========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getFirestore, collection, addDoc, getDoc, getDocs, query, orderBy, where,
    deleteDoc, doc, updateDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
    getStorage, ref, uploadBytes, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

/* =========================================================
   i18n — 다국어 시스템 (KOR / ENG)
   ========================================================= */
const I18N = {
    ko: {
        /* ----- 메뉴/공통 ----- */
        "nav.professionals": "소개",
        "nav.consultation": "상담 문의",
        "nav.cases": "성공 사례",
        "nav.notice": "소식",
        "nav.contact": "오시는 길",
        "nav.consults_admin": "상담 조회",
        "nav.login": "Login",
        "nav.logout": "Logout",
        "nav.language": "Language",
        "nav.menu_open": "메뉴 열기",
        "common.close": "닫기",
        "common.loading": "불러오는 중입니다.",
        "common.submit": "등록",
        "common.no_image": "No Image",

        /* ----- Hero ----- */
        "hero.title": "법률사무소 탄하",
        "hero.sub": "TANHA LAW OFFICE",
        "hero.pause": "Pause",
        "hero.play": "Play",

        /* ----- Professionals ----- */
        "pro.eyebrow": "Professionals",
        "pro.title": "대표변호사",
        "pro.role": "대표변호사 / Attorney at Law",
        "pro.name": "방소운",
        "pro.name_en": "Bang So-Woon",
        "pro.edu_title": "학력",
        "pro.edu_sub": "Education",
        "pro.career_title": "경력",
        "pro.career_sub": "Experience",
        "pro.period_now": "현",
        "pro.period_prev": "전",
        "pro.edu_1": "한양대학교 정책학과 졸업",
        "pro.edu_2": "부산대학교 법학전문대학원 졸업",
        "pro.career_1": "법률사무소 탄하 대표변호사",
        "pro.career_2": "전주지방법원 국선변호인·국선보조인",
        "pro.career_3": "전주지방검찰청 정읍지청 피해자 국선 변호사",
        "pro.career_4": "전주덕진경찰서 자문 변호사",
        "pro.career_5": "대한변호사협회 법률구조재단 법률구조 수행 변호사",
        "pro.career_6": "전북특별자치도 공동주택관리규약준칙 심의위원회 위원",
        "pro.career_7": "완주군 지적재조사위원회 위원",
        "pro.career_8": "완주군 경계결정위원회 위원",
        "pro.career_9": "전주시주거복지센터 주택임대차 법률상담 자문위원",
        "pro.career_10": "진안군가족센터 법률상담 자문 변호사",
        "pro.career_11": "전주여성의전화 가정폭력상담소 법률상담 자문 변호사",
        "pro.career_12": "전북이주여성상담소 법률상담 자문 변호사",
        "pro.career_13": "전국교직원노동조합 법률상담 자문위원",
        "pro.career_14": "전북지방변호사회 사법경찰평가특별위원회 및 인권·법률구조위원회 위원",
        "pro.career_15": "민주사회를 위한 변호사모임 여성/아동청소년/국제연대인권위원회 위원",
        "pro.career_16": "민주사회를 위한 변호사모임 전북지부 공익소송위원회 위원",
        "pro.career_17": "검찰 실무수습 과정 수료",
        "pro.career_18": "태권도진흥재단 고충심의위원회 위원",

        /* ----- Consultation ----- */
        "cons.eyebrow": "Consultation",
        "cons.title": "상담 문의",
        "cons.desc": "사건 내용을 알려주시면 신속히 회신드립니다.",
        "cons.name": "성함",
        "cons.phone": "연락처",
        "cons.email": "이메일",
        "cons.type": "상담 분야",
        "cons.type_civil": "민사",
        "cons.type_criminal": "형사",
        "cons.type_family": "가사",
        "cons.type_admin": "행정",
        "cons.type_etc": "기타",
        "cons.message": "상담 내용",
        "cons.message_ph": "사건 경위와 현재 상황을 가능한 한 상세히 적어주세요.",
        "cons.agree": "개인정보 수집 및 이용에 동의합니다.",
        "cons.submit": "상담 접수",
        "cons.submitting": "접수 중",
        "cons.already": "이미 상담을 신청하셨나요?",
        "cons.mylookup_link": "내 상담 조회 →",
        "cons.err_required": "모든 필수 항목을 입력해주세요.",
        "cons.err_agree": "개인정보 수집 및 이용에 동의해주세요.",
        "cons.err_submit": "접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",

        /* ----- Cases ----- */
        "cases.eyebrow": "Cases",
        "cases.title": "성공 사례",
        "cases.subdesc": "의뢰인과 함께 만들어낸 결과들을 소개합니다.",
        "cases.viewall": "전체 사례 보기",
        "cases.newpost": "새 성공사례 등록",
        "cases.filter_all": "전체",
        "cases.filter_success": "성공사례",
        "cases.filter_info": "법률정보",
        "cases.filter_other": "그외활동",
        "cases.empty_all": "아직 등록된 사례가 없습니다.",
        "cases.empty_filtered": "해당 분야의 사례가 없습니다.",
        "cases.load_fail": "사례를 불러오는 데 실패했습니다.",
        "cases.no_title": "(제목 없음)",
        "cases.back": "← 사례 목록으로 돌아가기",
        "cases.back_short": "← 사례 목록",
        "cases.detail_invalid": "잘못된 접근입니다.",
        "cases.detail_notfound": "해당 사례를 찾을 수 없습니다.",
        "cases.delete": "삭제",
        "cases.delete_detail": "사례 삭제",
        "cases.delete_confirm": "이 사례를 삭제하시겠습니까? (서버의 원본 이미지도 함께 삭제됩니다)",
        "cases.delete_fail": "삭제에 실패했습니다.",
        "cases.deleted": "삭제되었습니다.",
        "cases.detail_loadfail": "사례를 불러오는 데 실패했습니다.",
        "cases.notfound_title": "사례를 찾을 수 없습니다 | 법률사무소 탄하",

        /* ----- Post modal (사례 등록) ----- */
        "post.title": "성공사례 등록",
        "post.category": "분야",
        "post.date": "판결 일자 (선택)",
        "post.title_lbl": "제목",
        "post.title_ph": "예) 손해배상 청구 사건 승소",
        "post.summary_lbl": "요약",
        "post.summary_sub": "(목록에 표시될 한 줄 설명)",
        "post.summary_ph": "짧게 요약해주세요",
        "post.content_lbl": "상세 내용",
        "post.content_ph": "판결 요지, 사건 개요, 쟁점 등을 자세히 기재해주세요.",
        "post.image_lbl": "이미지 첨부",
        "post.image_sub": "(여러 장 선택 가능)",
        "post.uploading": "업로드 중",
        "post.saving": "저장 중",
        "post.success": "성공사례가 등록되었습니다.",
        "post.err_required": "제목과 내용을 모두 입력해주세요.",
        "post.err_submit": "등록에 실패했습니다: ",
        "post.upload_img": "이미지 업로드",

        /* ----- Notice ----- */
        "notice.eyebrow": "Notice",
        "notice.title": "소식",
        "notice.subdesc": "법률사무소 탄하의 새로운 소식과 법률 동향을 전해드립니다.",
        "notice.newpost": "새 소식 등록",
        "notice.empty_all": "아직 등록된 소식이 없습니다.",
        "notice.empty_filtered": "해당 분야의 소식이 없습니다.",
        "notice.load_fail": "소식을 불러오는 데 실패했습니다.",
        "notice.back": "← 소식 목록으로 돌아가기",
        "notice.back_short": "← 소식 목록",
        "notice.detail_invalid": "잘못된 접근입니다.",
        "notice.detail_notfound": "해당 소식을 찾을 수 없습니다.",
        "notice.delete": "삭제",
        "notice.delete_detail": "소식 삭제",
        "notice.delete_confirm": "이 소식을 삭제하시겠습니까? (서버의 원본 이미지도 함께 삭제됩니다)",
        "notice.notfound_title": "소식을 찾을 수 없습니다 | 법률사무소 탄하",
        "notice.detail_loadfail": "소식을 불러오는 데 실패했습니다.",
        "notice.post_title": "소식 등록",
        "notice.post_date_lbl": "게시 일자 (선택)",
        "notice.post_title_ph": "예) 2025년 신규 변호사 영입 안내",
        "notice.post_content_ph": "본문 내용을 자세히 기재해주세요.",
        "notice.post_success": "소식이 등록되었습니다.",

        /* ----- Contact ----- */
        "ct.eyebrow": "Contact",
        "ct.title": "찾아오시는 길",
        "ct.address": "주소",
        "ct.address_val": "전북 전주시 덕진구 만성중앙로 27, 4층 403호 (온누리법조타워)",
        "ct.phone": "전화",
        "ct.fax": "팩스",
        "ct.email": "이메일",
        "ct.hours": "업무시간",
        "ct.hours_val": "평일 09:00 – 18:00 (점심 12:00 – 13:00)",
        "ct.parking": "주차",
        "ct.parking_val_1": "온누리법조타워 지하 주차장 무료 이용",
        "ct.parking_val_2": "만성지구 제7공영주차장",
        "ct.map_naver": "네이버 지도",
        "ct.map_kakao": "카카오맵",
        "ct.map_google": "구글 지도",
        "ct.map_tmap": "티 맵",

        /* ----- Footer ----- */
        "ft.kakao": "카카오톡 상담",
        "ft.privacy": "개인정보처리방침",
        "ft.copy": "© 2025 TANHA LAW OFFICE. All Rights Reserved.",
        "ft.privacy_note": "",
        "ft.privacy_title_alt": "",

        /* ----- Login modal ----- */
        "login.title": "관리자 로그인",
        "login.email": "이메일",
        "login.password": "비밀번호",
        "login.submit": "로그인",
        "login.loading": "로그인 중",
        "login.fail": "로그인에 실패했습니다.",
        "login.logout_done": "로그아웃 되었습니다.",
        "login.locked": "로그인 시도가 5회 초과되어 일시적으로 차단되었습니다. {min}분 후 다시 시도해주세요.",
        "login.remaining": "남은 시도 횟수: {n}회",
        "login.bot_blocked": "비정상적인 접근이 감지되었습니다.",
        "login.email_invalid": "올바른 이메일 형식을 입력해주세요.",

        /* ----- Receipt modal ----- */
        "rc.title": "상담이 접수되었습니다",
        "rc.desc": "빠른 시일 내에 회신드리겠습니다.<br>아래 접수번호를 보관해주세요.",
        "rc.label": "접수번호",
        "rc.help": "이름과 연락처로 언제든 상담 진행 상황을 조회하실 수 있습니다.",
        "rc.ok": "확인",

        /* ----- My lookup modal ----- */
        "ml.title": "내 상담 내역 조회",
        "ml.desc": "신청 시 입력하신 이름과 연락처를 입력해주세요.",
        "ml.phone_ph": "신청 시 입력하신 번호 그대로",
        "ml.submit": "조회",
        "ml.loading": "조회 중",
        "ml.err_required": "성함과 연락처를 모두 입력해주세요.",
        "ml.empty": "일치하는 상담 내역이 없습니다.<br>성함과 연락처를 다시 확인해주세요.",
        "ml.err": "조회 중 오류가 발생했습니다.<br>",
        "ml.no_num": "(번호 없음)",
        "ml.status_done": "처리 완료",
        "ml.status_pending": "접수됨",
        "ml.field": "상담 분야 — ",

        /* ----- Consults modal (admin) ----- */
        "cm.title": "접수된 상담 내역",
        "cm.count_unit": "건",
        "cm.loading": "불러오는 중입니다.",
        "cm.admin_only": "관리자만 조회할 수 있습니다.",
        "cm.empty": "접수된 상담이 없습니다.",
        "cm.load_fail": "상담을 불러오는 데 실패했습니다.",
        "cm.contact": "연락처",
        "cm.email": "이메일",
        "cm.mark_done": "처리완료",
        "cm.mark_undone": "처리완료 취소",
        "cm.delete": "삭제",
        "cm.delete_confirm": "이 상담 내역을 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.",
        "cm.delete_fail": "삭제에 실패했습니다.",
        "cm.toggle_fail": "상태 변경에 실패했습니다.",
        "cm.no_name": "(이름 없음)",

        /* ----- Translate button (동적 콘텐츠 자동번역) ----- */
        "tx.translate": "🌐 영문으로 자동번역",
        "tx.original": "🌐 원문 보기",
        "tx.loading": "번역 중...",
        "tx.note": "* 자동번역 결과는 참고용입니다."
    },
    en: {
        /* ----- Menu / common ----- */
        "nav.professionals": "Professionals",
        "nav.consultation": "Consultation",
        "nav.cases": "Cases",
        "nav.notice": "Notice",
        "nav.contact": "Contact",
        "nav.consults_admin": "Consultations",
        "nav.login": "Login",
        "nav.logout": "Logout",
        "nav.language": "Language",
        "nav.menu_open": "Open menu",
        "common.close": "Close",
        "common.loading": "Loading…",
        "common.submit": "Submit",
        "common.no_image": "No Image",

        /* ----- Hero ----- */
        "hero.title": "TANHA LAW OFFICE",
        "hero.sub": "법률사무소 탄하",
        "hero.pause": "Pause",
        "hero.play": "Play",

        /* ----- Professionals ----- */
        "pro.eyebrow": "Professionals",
        "pro.title": "Managing Attorney",
        "pro.role": "Managing Attorney / Attorney at Law",
        "pro.name": "Bang So-Woon",
        "pro.name_en": "방소운",
        "pro.edu_title": "Education",
        "pro.edu_sub": "학력",
        "pro.career_title": "Experience",
        "pro.career_sub": "경력",
        "pro.period_now": "Present",
        "pro.period_prev": "Past",
        "pro.edu_1": "B.A. in Public Policy, Hanyang University",
        "pro.edu_2": "J.D., Pusan National University School of Law",
        "pro.career_1": "Managing Attorney, Tanha Law Office",
        "pro.career_2": "Court-Appointed Defense Counsel & Assistant, Jeonju District Court",
        "pro.career_3": "Court-Appointed Victim's Counsel, Jeongeup Branch, Jeonju District Prosecutors' Office",
        "pro.career_4": "Advisory Attorney, Jeonju Deokjin Police Station",
        "pro.career_5": "Legal Aid Attorney, Korean Bar Association Legal Aid Foundation",
        "pro.career_6": "Member, Apartment Management Bylaw Review Committee, Jeonbuk State",
        "pro.career_7": "Member, Cadastral Resurvey Committee, Wanju County",
        "pro.career_8": "Member, Boundary Determination Committee, Wanju County",
        "pro.career_9": "Legal Advisor for Residential Lease Counseling, Jeonju City Housing Welfare Center",
        "pro.career_10": "Legal Advisory Attorney, Jinan County Family Center",
        "pro.career_11": "Legal Advisory Attorney, Jeonju Women's Hotline – Domestic Violence Counseling Center",
        "pro.career_12": "Legal Advisory Attorney, Jeonbuk Migrant Women's Counseling Center",
        "pro.career_13": "Legal Advisor, Korean Teachers and Education Workers' Union",
        "pro.career_14": "Member, Judicial Police Evaluation Committee & Human Rights / Legal Aid Committee, Jeonbuk Regional Bar Association",
        "pro.career_15": "Member, Women / Children & Youth / International Solidarity Human Rights Committee, MINBYUN – Lawyers for a Democratic Society",
        "pro.career_16": "Member, Public Interest Litigation Committee, Jeonbuk Branch, MINBYUN – Lawyers for a Democratic Society",
        "pro.career_17": "Completed Prosecutorial Practical Training Program",
        "pro.career_18": "Member, Grievance Review Committee, Taekwondo Promotion Foundation",

        /* ----- Consultation ----- */
        "cons.eyebrow": "Consultation",
        "cons.title": "Request a Consultation",
        "cons.desc": "Tell us about your case and we'll get back to you promptly.",
        "cons.name": "Name",
        "cons.phone": "Phone",
        "cons.email": "Email",
        "cons.type": "Practice Area",
        "cons.type_civil": "Civil",
        "cons.type_criminal": "Criminal",
        "cons.type_family": "Family",
        "cons.type_admin": "Administrative",
        "cons.type_etc": "Other",
        "cons.message": "Message",
        "cons.message_ph": "Please describe the background and current status of your case in as much detail as possible.",
        "cons.agree": "I consent to the collection and use of my personal information.",
        "cons.submit": "Submit Request",
        "cons.submitting": "Submitting…",
        "cons.already": "Already submitted a request?",
        "cons.mylookup_link": "Check my consultation →",
        "cons.err_required": "Please fill out all required fields.",
        "cons.err_agree": "Please agree to the collection and use of personal information.",
        "cons.err_submit": "An error occurred while submitting. Please try again later.",

        /* ----- Cases ----- */
        "cases.eyebrow": "Cases",
        "cases.title": "Success Cases",
        "cases.subdesc": "Results we've achieved together with our clients.",
        "cases.viewall": "View all cases",
        "cases.newpost": "New case post",
        "cases.filter_all": "All",
        "cases.filter_success": "Success",
        "cases.filter_info": "Legal Info",
        "cases.filter_other": "Other",
        "cases.empty_all": "No cases have been posted yet.",
        "cases.empty_filtered": "No cases in this category.",
        "cases.load_fail": "Failed to load cases.",
        "cases.no_title": "(No title)",
        "cases.back": "← Back to case list",
        "cases.back_short": "← Case list",
        "cases.detail_invalid": "Invalid access.",
        "cases.detail_notfound": "This case could not be found.",
        "cases.delete": "Delete",
        "cases.delete_detail": "Delete case",
        "cases.delete_confirm": "Delete this case? (The original images on the server will also be deleted.)",
        "cases.delete_fail": "Deletion failed.",
        "cases.deleted": "Deleted.",
        "cases.detail_loadfail": "Failed to load this case.",
        "cases.notfound_title": "Case not found | TANHA LAW OFFICE",

        /* ----- Post modal ----- */
        "post.title": "Post a Success Case",
        "post.category": "Category",
        "post.date": "Judgment date (optional)",
        "post.title_lbl": "Title",
        "post.title_ph": "e.g. Won a damages claim",
        "post.summary_lbl": "Summary",
        "post.summary_sub": "(one-line description for the list)",
        "post.summary_ph": "A short summary",
        "post.content_lbl": "Details",
        "post.content_ph": "Please describe the ruling, case outline, and key issues in detail.",
        "post.image_lbl": "Attach images",
        "post.image_sub": "(multiple files allowed)",
        "post.uploading": "Uploading…",
        "post.saving": "Saving…",
        "post.success": "Case has been posted.",
        "post.err_required": "Please enter both title and content.",
        "post.err_submit": "Submission failed: ",
        "post.upload_img": "Uploading image",

        /* ----- Notice ----- */
        "notice.eyebrow": "Notice",
        "notice.title": "Notice",
        "notice.subdesc": "News and legal updates from Tanha Law Office.",
        "notice.newpost": "New notice post",
        "notice.empty_all": "No notices have been posted yet.",
        "notice.empty_filtered": "No notices in this category.",
        "notice.load_fail": "Failed to load notices.",
        "notice.back": "← Back to notice list",
        "notice.back_short": "← Notice list",
        "notice.detail_invalid": "Invalid access.",
        "notice.detail_notfound": "This notice could not be found.",
        "notice.delete": "Delete",
        "notice.delete_detail": "Delete notice",
        "notice.delete_confirm": "Delete this notice? (The original images on the server will also be deleted.)",
        "notice.notfound_title": "Notice not found | TANHA LAW OFFICE",
        "notice.detail_loadfail": "Failed to load this notice.",
        "notice.post_title": "Post a Notice",
        "notice.post_date_lbl": "Post date (optional)",
        "notice.post_title_ph": "e.g. Welcoming a new attorney in 2025",
        "notice.post_content_ph": "Please write the full content in detail.",
        "notice.post_success": "Notice has been posted.",

        /* ----- Contact ----- */
        "ct.eyebrow": "Contact",
        "ct.title": "Visit Us",
        "ct.address": "Address",
        "ct.address_val": "Room 403, 4F, Onnuri Legal Tower, 27 Manseong-jungang-ro, Deokjin-gu, Jeonju, Jeonbuk State, South Korea",
        "ct.phone": "Phone",
        "ct.fax": "Fax",
        "ct.email": "Email",
        "ct.hours": "Hours",
        "ct.hours_val": "Mon–Fri 09:00 – 18:00 (Lunch 12:00 – 13:00)",
        "ct.parking": "Parking",
        "ct.parking_val_1": "Free parking at Onnuri Legal Tower underground",
        "ct.parking_val_2": "Manseong District Public Parking Lot No. 7",
        "ct.map_naver": "Naver Map",
        "ct.map_kakao": "Kakao Map",
        "ct.map_google": "Google Maps",
        "ct.map_tmap": "T map",

        /* ----- Footer ----- */
        "ft.kakao": "KakaoTalk Chat",
        "ft.privacy": "Privacy Policy",
        "ft.copy": "© 2025 TANHA LAW OFFICE. All Rights Reserved.",
        "ft.privacy_note": "<strong>Note:</strong> This Privacy Policy is provided in Korean only, as it implements the Korean Personal Information Protection Act (개인정보 보호법). For inquiries in English, please contact <a href=\"mailto:tanhalawoffice@gmail.com\">tanhalawoffice@gmail.com</a>.",
        "ft.privacy_title_alt": "Privacy Policy",

        /* ----- Login modal ----- */
        "login.title": "Admin Login",
        "login.email": "Email",
        "login.password": "Password",
        "login.submit": "Log in",
        "login.loading": "Logging in…",
        "login.fail": "Login failed.",
        "login.logout_done": "You have been logged out.",
        "login.locked": "Too many failed attempts. Please try again in {min} minutes.",
        "login.remaining": "Remaining attempts: {n}",
        "login.bot_blocked": "Abnormal activity detected.",
        "login.email_invalid": "Please enter a valid email address.",

        /* ----- Receipt ----- */
        "rc.title": "Your request has been received",
        "rc.desc": "We'll get back to you shortly.<br>Please keep the reference number below.",
        "rc.label": "Reference No.",
        "rc.help": "You can check the status of your consultation anytime using your name and phone.",
        "rc.ok": "OK",

        /* ----- My lookup ----- */
        "ml.title": "Look up my consultation",
        "ml.desc": "Please enter the name and phone number used when you submitted the request.",
        "ml.phone_ph": "The number you used when submitting",
        "ml.submit": "Look up",
        "ml.loading": "Searching…",
        "ml.err_required": "Please enter both name and phone.",
        "ml.empty": "No matching consultation was found.<br>Please double-check the name and phone number.",
        "ml.err": "An error occurred during lookup.<br>",
        "ml.no_num": "(No number)",
        "ml.status_done": "Resolved",
        "ml.status_pending": "Received",
        "ml.field": "Practice Area — ",

        /* ----- Consults modal ----- */
        "cm.title": "Received Consultations",
        "cm.count_unit": "",
        "cm.loading": "Loading…",
        "cm.admin_only": "Admin access only.",
        "cm.empty": "No consultations received.",
        "cm.load_fail": "Failed to load consultations.",
        "cm.contact": "Phone",
        "cm.email": "Email",
        "cm.mark_done": "Mark resolved",
        "cm.mark_undone": "Undo resolved",
        "cm.delete": "Delete",
        "cm.delete_confirm": "Delete this consultation?\nThis cannot be undone.",
        "cm.delete_fail": "Deletion failed.",
        "cm.toggle_fail": "Failed to change status.",
        "cm.no_name": "(No name)",

        /* ----- Translate ----- */
        "tx.translate": "🌐 Auto-translate to English",
        "tx.original": "🌐 Show original (Korean)",
        "tx.loading": "Translating…",
        "tx.note": "* Auto-translation is for reference only."
    }
};

const LANG_KEY = "tanha-lang";
function getLang() {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "en" || saved === "ko") return saved;
    return "ko";
}
function setLang(lang) {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang === "en" ? "en" : "ko";
}
function t(key) {
    const lang = getLang();
    const dict = I18N[lang] || I18N.ko;
    if (dict[key] != null) return dict[key];
    if (I18N.ko[key] != null) return I18N.ko[key];
    return key;
}

/** data-i18n / data-i18n-attr 속성 기반으로 페이지 텍스트 교체 */
function applyI18n(root = document) {
    // 텍스트 교체
    root.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        const val = t(key);
        // HTML이 포함된 경우 (예: <br>) html 모드로 처리
        if (el.hasAttribute("data-i18n-html") || val.includes("<")) {
            el.innerHTML = val;
        } else {
            el.textContent = val;
        }
    });
    // 속성 (placeholder, aria-label, title 등) 교체
    root.querySelectorAll("[data-i18n-attr]").forEach(el => {
        // 형식: "placeholder:cons.name_ph, aria-label:nav.menu_open"
        const spec = el.getAttribute("data-i18n-attr");
        spec.split(",").forEach(part => {
            const [attr, key] = part.split(":").map(s => s.trim());
            if (attr && key) el.setAttribute(attr, t(key));
        });
    });
    // <html lang="..">
    document.documentElement.lang = getLang() === "en" ? "en" : "ko";
}

/** 언어 변경 후 페이지 전체 재구성 트리거 */
function switchLanguage(lang) {
    if (lang !== "ko" && lang !== "en") return;
    if (getLang() === lang) return;
    setLang(lang);
    applyI18n();
    updateLangSwitcherUI();
    // 동적으로 그려진 부분들 다시 그리기
    if (typeof allCasesCache !== "undefined") allCasesCache = null;
    if (typeof allNoticesCache !== "undefined") allNoticesCache = null;
    if (document.querySelector("#cases-list") && typeof loadCases === "function") loadCases();
    if (document.querySelector("#notices-list") && typeof loadNotices === "function") loadNotices();
    if (document.querySelector("#case-article") && typeof loadCaseDetail === "function") loadCaseDetail();
    if (document.querySelector("#notice-article") && typeof loadNoticeDetail === "function") loadNoticeDetail();
    if (document.querySelector("#consults-modal.is-open") && typeof loadConsultations === "function") loadConsultations();
    // Auth 메뉴(Login/Logout)도 다시
    updateAuthMenuText();
    // 비디오 버튼
    const vb = document.getElementById("video-control-btn");
    if (vb) {
        const v = document.getElementById("main-video");
        vb.textContent = v && !v.paused ? t("hero.pause") : t("hero.play");
    }
}

function updateLangSwitcherUI() {
    const cur = getLang();
    document.querySelectorAll(".lang-switch").forEach(sw => {
        sw.querySelectorAll(".lang-btn").forEach(b => {
            b.classList.toggle("is-active", b.dataset.lang === cur);
        });
        const labelEl = sw.querySelector(".lang-current-label");
        if (labelEl) labelEl.textContent = cur === "en" ? "ENG" : "KOR";
    });
}

function updateAuthMenuText() {
    const authMenu = document.getElementById("auth-menu");
    if (!authMenu) return;
    const link = authMenu.querySelector("a");
    if (!link) return;
    const action = link.getAttribute("data-action");
    if (action === "logout") link.textContent = t("nav.logout");
    else if (action === "open-login") link.textContent = t("nav.login");
}

/** Firestore에 저장된 한국어 카테고리/태그를 현재 언어로 변환 */
const CATEGORY_MAP = {
    "민사":   { ko: "민사",   en: "Civil" },
    "형사":   { ko: "형사",   en: "Criminal" },
    "가사":   { ko: "가사",   en: "Family" },
    "가사/상속": { ko: "가사/상속", en: "Family / Inheritance" },
    "행정":   { ko: "행정",   en: "Administrative" },
    "기타":   { ko: "기타",   en: "Other" },
    "성공사례": { ko: "성공사례", en: "Success" },
    "법률정보": { ko: "법률정보", en: "Legal Info" },
    "그외활동": { ko: "그외활동", en: "Other Activity" },
    "탄하소식": { ko: "탄하소식", en: "Tanha News" },
    "소식":   { ko: "소식",   en: "News" }
};
function translateCategory(cat) {
    const lang = getLang();
    if (CATEGORY_MAP[cat]) return CATEGORY_MAP[cat][lang] || cat;
    return cat;
}

/** 메뉴의 언어 전환 UI(드롭다운) 자동 주입 */
function injectLangSwitcher() {
    document.querySelectorAll(".nav-links").forEach(navUl => {
        if (navUl.querySelector(".lang-switch")) return;
        const li = document.createElement("li");
        li.className = "lang-switch-wrap";
        li.innerHTML = `
            <div class="lang-switch" role="group" aria-label="Language">
                <span class="lang-label" data-i18n="nav.language">Language</span>
                <button type="button" class="lang-btn" data-lang="ko">KOR</button>
                <span class="lang-divider">|</span>
                <button type="button" class="lang-btn" data-lang="en">ENG</button>
            </div>
        `;
        navUl.appendChild(li);
    });

    document.querySelectorAll(".lang-switch .lang-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            switchLanguage(btn.dataset.lang);
        });
    });
}

/* DOM ready 후 i18n 초기화 */
function initI18n() {
    setLang(getLang()); // <html lang> 동기화
    injectLangSwitcher();
    applyI18n();
    updateLangSwitcherUI();
    updateAuthMenuText();
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initI18n);
} else {
    initI18n();
}

/* =========================================================
   Auto-translate (Firestore 본문 자동 번역)
   - Google Translate 무료 endpoint 사용 (gtx)
   - 키 불필요, CORS 허용
   ========================================================= */
async function autoTranslateText(text, target = "en", source = "ko") {
    if (!text || !text.trim()) return "";
    // 매우 긴 텍스트는 청크로 나누기 (gtx URL은 길이 제한이 있음)
    const chunks = [];
    let remaining = text;
    const MAX = 4500;
    while (remaining.length > MAX) {
        // 가능한 한 줄바꿈/마침표 경계에서 자르기
        let cut = remaining.lastIndexOf("\n", MAX);
        if (cut < 1000) cut = remaining.lastIndexOf(".", MAX);
        if (cut < 1000) cut = MAX;
        chunks.push(remaining.slice(0, cut));
        remaining = remaining.slice(cut);
    }
    chunks.push(remaining);

    const out = [];
    for (const chunk of chunks) {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(chunk)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Translation request failed");
        const data = await res.json();
        // data[0] 은 [[ "번역결과", "원문", ... ], ...] 형태
        const translated = (data[0] || []).map(seg => seg[0] || "").join("");
        out.push(translated);
    }
    return out.join("");
}

/** 본문 자동번역 토글 — 버튼이 달린 컨테이너 안의 텍스트 노드를 번역해서 보여줌 */
async function toggleAutoTranslate(button) {
    const targetSel = button.dataset.translateTarget;
    const titleSel = button.dataset.translateTitle;
    const summarySel = button.dataset.translateSummary;
    const targets = [];
    if (titleSel) targets.push(document.querySelector(titleSel));
    if (summarySel) targets.push(document.querySelector(summarySel));
    if (targetSel) targets.push(document.querySelector(targetSel));
    const els = targets.filter(Boolean);
    if (els.length === 0) return;

    // 토글 상태 확인
    const isTranslated = button.dataset.state === "translated";
    if (isTranslated) {
        // 원문 복원
        els.forEach(el => {
            const orig = el.dataset.original;
            if (orig != null) el.innerHTML = orig;
        });
        button.dataset.state = "";
        button.textContent = t("tx.translate");
        return;
    }

    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = t("tx.loading");
    try {
        for (const el of els) {
            if (el.dataset.original == null) el.dataset.original = el.innerHTML;
            const raw = el.textContent || "";
            const translated = await autoTranslateText(raw, "en", "ko");
            // <br> 보존을 위해 줄바꿈→<br>
            el.innerHTML = escapeHTML(translated).replace(/\n/g, "<br>");
        }
        button.dataset.state = "translated";
        button.textContent = t("tx.original");
    } catch (err) {
        console.error("Translate error:", err);
        alert("자동번역에 실패했습니다 / Auto-translation failed.");
        button.textContent = originalLabel;
    } finally {
        button.disabled = false;
    }
}

/* ---------- Firebase ---------- */
const firebaseConfig = {
    apiKey: "AIzaSyCzcdf8QBZFTtKh6vTM2f_Awb9Vncb3EtU",
    authDomain: "tanhalaw-e5d06.firebaseapp.com",
    projectId: "tanhalaw-e5d06",
    storageBucket: "tanhalaw-e5d06.firebasestorage.app",
    messagingSenderId: "882787510142",
    appId: "1:882787510142:web:36f4b2342ed9a2dfcd752f"
};
const ADMIN_EMAIL = "tanhalaw1@gmail.com";

const MAIL_URL = "https://script.google.com/macros/s/AKfycbw_LmMmLvQv6MhD6438LLjRGV9MIo67A2a5789UeWTslD56Db7fE6_S3J5npHn2gV-q/exec";

const app     = initializeApp(firebaseConfig);
const auth    = getAuth(app);
const db      = getFirestore(app);
const storage = getStorage(app);

/* =========================================================
   SECURITY MODULE — Brute-force 방어 / 관리자 검증 / 봇 차단
   ========================================================= */

const SEC = {
    MAX_ATTEMPTS: 5,
    LOCK_MINUTES: 15,
    LOCK_MS: 15 * 60 * 1000,
    // 클라이언트 1차 방어 키 (localStorage)
    LS_KEY: "tanha_login_attempts_v1",
    // 상담 폼 제출 쿨다운 (스팸 방지)
    CONSULT_LS_KEY: "tanha_consult_last_v1",
    CONSULT_COOLDOWN_MS: 30 * 1000, // 30초
};

/* ---------- 클라이언트 측 1차 방어 (localStorage) ---------- */
function readLocalAttempt(emailKey) {
    try {
        const raw = localStorage.getItem(SEC.LS_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        return data[emailKey] || null;
    } catch { return null; }
}
function writeLocalAttempt(emailKey, payload) {
    try {
        const raw = localStorage.getItem(SEC.LS_KEY);
        const data = raw ? JSON.parse(raw) : {};
        if (payload === null) delete data[emailKey];
        else data[emailKey] = payload;
        localStorage.setItem(SEC.LS_KEY, JSON.stringify(data));
    } catch {}
}

/**
 * 잠금 여부 확인. 잠겨있으면 { locked: true, remainingMs }, 아니면 { locked: false, attempts }
 * 클라이언트(localStorage) + 서버(Firestore) 양쪽 모두 확인.
 */
async function checkLockStatus(email) {
    const emailKey = email.toLowerCase();
    const now = Date.now();

    // 1) 클라이언트 측 확인 (빠른 차단)
    const local = readLocalAttempt(emailKey);
    if (local && local.lockedUntil && local.lockedUntil > now) {
        return { locked: true, remainingMs: local.lockedUntil - now, attempts: local.count || SEC.MAX_ATTEMPTS };
    }

    // 2) 서버 측 확인 (우회 차단 — 진짜 방어선)
    try {
        const docId = encodeAttemptId(emailKey);
        const snap = await getDoc(doc(db, "loginAttempts", docId));
        if (snap.exists()) {
            const d = snap.data();
            const lockedUntil = d.lockedUntil?.toMillis ? d.lockedUntil.toMillis() : (d.lockedUntilMs || 0);
            if (lockedUntil > now) {
                // 서버 잠금을 클라이언트에도 동기화
                writeLocalAttempt(emailKey, { count: d.count || SEC.MAX_ATTEMPTS, lockedUntil });
                return { locked: true, remainingMs: lockedUntil - now, attempts: d.count || SEC.MAX_ATTEMPTS };
            }
            return { locked: false, attempts: d.count || 0 };
        }
    } catch (err) {
        console.warn("[security] 서버 잠금 조회 실패 (오프라인 가능):", err?.message);
    }
    return { locked: false, attempts: (local?.count || 0) };
}

/** Firestore 문서 ID 안전화 (이메일에서 . 사용 불가 문자 변환) */
function encodeAttemptId(email) {
    return email.toLowerCase().replace(/[^a-z0-9]/g, "_");
}

/**
 * 로그인 실패 기록. 5회 이상이면 lockedUntil 설정.
 * 서버 + 로컬 양쪽 모두 갱신.
 */
async function recordLoginFailure(email) {
    const emailKey = email.toLowerCase();
    const docId = encodeAttemptId(emailKey);
    const now = Date.now();
    const docRef = doc(db, "loginAttempts", docId);

    let nextCount = 1;
    let lockedUntilMs = 0;

    try {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            const d = snap.data();
            const prevLockUntil = d.lockedUntil?.toMillis ? d.lockedUntil.toMillis() : (d.lockedUntilMs || 0);
            // 이전 잠금이 끝났다면 카운트 리셋
            if (prevLockUntil && prevLockUntil < now) {
                nextCount = 1;
            } else {
                nextCount = (d.count || 0) + 1;
            }
        }

        if (nextCount >= SEC.MAX_ATTEMPTS) {
            lockedUntilMs = now + SEC.LOCK_MS;
        }

        await setDocSafe(docRef, {
            email: emailKey,
            count: nextCount,
            lockedUntilMs: lockedUntilMs || null,
            lockedUntil: lockedUntilMs ? new Date(lockedUntilMs) : null,
            lastFailAt: serverTimestamp(),
        });
    } catch (err) {
        console.warn("[security] 서버 실패 기록 실패:", err?.message);
    }

    // 로컬도 갱신
    writeLocalAttempt(emailKey, {
        count: nextCount,
        lockedUntil: lockedUntilMs || 0,
    });

    return {
        attempts: nextCount,
        locked: !!lockedUntilMs,
        lockedUntilMs,
        remaining: Math.max(0, SEC.MAX_ATTEMPTS - nextCount),
    };
}

/** 로그인 성공 시 카운터 리셋 */
async function resetLoginAttempts(email) {
    const emailKey = email.toLowerCase();
    const docId = encodeAttemptId(emailKey);
    try {
        await deleteDoc(doc(db, "loginAttempts", docId));
    } catch (err) {
        // 문서가 없으면 정상
    }
    writeLocalAttempt(emailKey, null);
}

/** Firestore setDoc 래퍼 (merge=true 기본) */
async function setDocSafe(docRef, data) {
    return setDoc(docRef, data, { merge: true });
}

/* ---------- 관리자 검증 (Firestore admins 컬렉션 + Auth 결합) ---------- */
/**
 * 현재 로그인한 사용자가 관리자인지 서버 측 컬렉션으로 검증.
 * admins/{uid} 문서가 존재하면 관리자.
 * 결과는 5분간 메모리 캐싱하여 Firestore 호출 절약.
 */
let _adminCache = { uid: null, isAdmin: false, checkedAt: 0 };
const ADMIN_CACHE_MS = 5 * 60 * 1000;

async function verifyIsAdmin(user) {
    if (!user) {
        _adminCache = { uid: null, isAdmin: false, checkedAt: 0 };
        return false;
    }
    const now = Date.now();
    if (_adminCache.uid === user.uid && (now - _adminCache.checkedAt) < ADMIN_CACHE_MS) {
        return _adminCache.isAdmin;
    }
    try {
        const snap = await getDoc(doc(db, "admins", user.uid));
        const isAdmin = snap.exists();
        _adminCache = { uid: user.uid, isAdmin, checkedAt: now };
        return isAdmin;
    } catch (err) {
        console.warn("[security] 관리자 검증 실패:", err?.message);
        // 실패 시 false (안전 우선)
        _adminCache = { uid: user.uid, isAdmin: false, checkedAt: now };
        return false;
    }
}

/** 동기적으로 마지막 검증 결과를 반환 (UI 렌더링용; 검증은 onAuthStateChanged에서 먼저 수행됨) */
function isAdminSync() {
    return _adminCache.isAdmin && auth.currentUser && _adminCache.uid === auth.currentUser.uid;
}

/* ---------- 봇 방지 (간이 honeypot + 타이밍 체크) ---------- */
const BOT = {
    formLoadTime: new WeakMap(),
    MIN_FILL_MS: 1500, // 1.5초 미만에 제출되면 봇으로 판단
};

function setupHoneypot(form) {
    if (!form) return;
    // 이미 있으면 패스
    if (form.querySelector('input[name="hp_website"]')) return;
    const wrap = document.createElement("div");
    wrap.style.cssText = "position:absolute;left:-9999px;top:-9999px;height:0;width:0;overflow:hidden;opacity:0;pointer-events:none;";
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML = `
        <label>Website (do not fill)<input type="text" name="hp_website" tabindex="-1" autocomplete="off"></label>
    `;
    form.appendChild(wrap);
    BOT.formLoadTime.set(form, Date.now());
}

function checkBotSignals(form) {
    const hp = form.querySelector('input[name="hp_website"]');
    if (hp && hp.value.trim().length > 0) return "honeypot";
    const t0 = BOT.formLoadTime.get(form);
    if (t0 && (Date.now() - t0) < BOT.MIN_FILL_MS) return "tooFast";
    return null;
}

/* ---------- 이메일 형식 검증 (서버 도달 전 1차 검증) ---------- */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

/* ---------- 잠금 메시지 포매팅 ---------- */
function formatLockMessage(remainingMs) {
    const min = Math.ceil(remainingMs / 60000);
    return t("login.locked").replace("{min}", min);
}
function formatRemainingMessage(remaining) {
    return t("login.remaining").replace("{n}", remaining);
}

/* ========================================================= */

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
onAuthStateChanged(auth, async (user) => {
    const authMenu     = $("#auth-menu");
    const adminMenu    = $("#admin-menu");
    const adminSection = $("#admin-only-section");
    const adminSectionNotice = $("#admin-only-section-notice");

    // 서버 측 admins 컬렉션으로 검증 (이메일 단순 비교가 아님 - 변조 불가)
    const isAdmin = await verifyIsAdmin(user);

    if (authMenu) {
        authMenu.innerHTML = isAdmin
            ? `<a href="#" data-action="logout">${t("nav.logout")}</a>`
            : `<a href="#" data-action="open-login">${t("nav.login")}</a>`;
    }
    if (adminMenu) adminMenu.hidden = !isAdmin;
    if (adminSection) adminSection.hidden = !isAdmin;
    if (adminSectionNotice) adminSectionNotice.hidden = !isAdmin;

    // 페이지에 cases-list가 있으면 다시 로드 (관리자 권한 따라 삭제 버튼 표시 변동)
    if ($("#cases-list")) {
        allCasesCache = null;
        loadCases();
    }

    // 사례 상세 페이지면 다시 그리기 (관리자 삭제 버튼 표시)
    if ($("#case-article")) {
        loadCaseDetail();
    }

    // 소식 목록 페이지
    if ($("#notices-list")) {
        allNoticesCache = null;
        loadNotices();
    }

    // 소식 상세 페이지
    if ($("#notice-article")) {
        loadNoticeDetail();
    }
});

/* ---------- Consultation ---------- */
const consultForm = $("#consultation-form");
if (consultForm) {
    // 봇 방지 honeypot
    setupHoneypot(consultForm);

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

        // ─── 봇 시그널 ───
        const botReason = checkBotSignals(consultForm);
        if (botReason) {
            console.warn("[security] consult bot blocked:", botReason);
            // 봇으로 보이면 조용히 실패 (UX상 정상 응답인 척)
            alert(t("cons.err_submit"));
            return;
        }

        // ─── 쿨다운 (스팸 방지) ───
        try {
            const last = parseInt(localStorage.getItem(SEC.CONSULT_LS_KEY) || "0", 10);
            if (last && (Date.now() - last) < SEC.CONSULT_COOLDOWN_MS) {
                const remain = Math.ceil((SEC.CONSULT_COOLDOWN_MS - (Date.now() - last)) / 1000);
                alert(`잠시 후 다시 시도해주세요. (${remain}초)`);
                return;
            }
        } catch {}

        // ─── 입력 검증 강화 ───
        if (!name || !phone || !email || !message) {
            alert(t("cons.err_required"));
            return;
        }
        if (!agreed) {
            alert(t("cons.err_agree"));
            return;
        }
        if (!isValidEmail(email)) {
            alert(t("login.email_invalid"));
            return;
        }
        // 길이 상한 (DoS 방지)
        if (name.length > 50 || phone.length > 30 || email.length > 254 || message.length > 5000) {
            alert(t("cons.err_submit"));
            return;
        }
        // 전화번호 숫자 외 7자 미만 거부 (간단한 형식 검증)
        const phoneDigits = normalizePhone(phone);
        if (phoneDigits.length < 9 || phoneDigits.length > 15) {
            alert(t("cons.err_submit"));
            return;
        }

        btn.disabled = true;
        btn.textContent = t("cons.submitting");

        try {
            const receiptNumber = generateReceiptNumber();
            const phoneNormalized = phoneDigits;

            await addDoc(collection(db, "consultations"), {
                name, phone, phoneNormalized, email, type, message,
                receiptNumber,
                done: false,
                timestamp: serverTimestamp()
            });

            // 쿨다운 기록
            try { localStorage.setItem(SEC.CONSULT_LS_KEY, String(Date.now())); } catch {}

            const formData = { name, phone, email, type, message };
            await fetch(MAIL_URL, {
                method: "POST",
                body: JSON.stringify(formData),
                headers: { "Content-Type": "text/plain;charset=utf-8" }
            }).catch(err => console.log("이메일 알림 실패:", err));

            consultForm.reset();
            // honeypot 재설치 (reset에 안전하게)
            BOT.formLoadTime.set(consultForm, Date.now());

            // 접수번호 안내 모달
            const numEl = $("#receipt-number");
            if (numEl) numEl.textContent = receiptNumber;
            openModal("receipt-modal");
        } catch (err) {
            console.error(err);
            alert(t("cons.err_submit"));
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
}

/* ---------- Cases ---------- */
let allCasesCache = null;     // 페이지에서 한 번만 로드 후 캐시
let currentFilter = "all";

async function loadCases() {
    const list = $("#cases-list");
    if (!list) return;

    const limit = parseInt(list.dataset.limit || "0", 10);

    try {
        if (!allCasesCache) {
            const q = query(collection(db, "cases"), orderBy("timestamp", "desc"));
            const snap = await getDocs(q);
            allCasesCache = [];
            snap.forEach(s => allCasesCache.push({ id: s.id, ...s.data() }));
        }

        // 필터 적용
        let items = allCasesCache;
        if (currentFilter !== "all") {
            items = items.filter(d => (d.category || "기타") === currentFilter);
        }
        // limit 적용
        if (limit > 0) items = items.slice(0, limit);

        if (items.length === 0) {
            list.innerHTML = `<div class="cases-empty">${
                currentFilter === "all"
                    ? t("cases.empty_all")
                    : t("cases.empty_filtered")
            }</div>`;
            return;
        }

        const isAdmin = isAdminSync();
        const html = items.map(d => {
            const id       = d.id;
            const title    = escapeHTML(d.title || t("cases.no_title"));
            const category = escapeHTML(translateCategory(d.category || "기타"));
            const summary  = escapeHTML(d.summary || (d.content ? d.content.slice(0, 100) : ""));
            const date     = formatCaseDate(d.judgmentDate || d.timestamp);

            // 첫번째 이미지 (다중 이미지 배열 또는 단일 imageUrl 호환)
            let firstImg = null;
            if (Array.isArray(d.images) && d.images.length > 0) firstImg = d.images[0];
            else if (d.imageUrl) firstImg = d.imageUrl;

            const imgHtml = firstImg
                ? `<img src="${escapeHTML(firstImg)}" alt="${title}" class="case-img" loading="lazy">`
                : `<div class="case-no-img">${t("common.no_image")}</div>`;

            const delHtml = isAdmin
                ? `<button class="delete-btn" data-action="delete-case" data-id="${escapeHTML(id)}" type="button">${t("cases.delete")}</button>`
                : "";

            return `
                <a href="case.html?id=${encodeURIComponent(id)}" class="case-card">
                    ${imgHtml}
                    <div class="case-body">
                        <div class="case-meta">
                            <span class="case-category">${category}</span>
                            ${date ? `<span>${escapeHTML(date)}</span>` : ""}
                        </div>
                        <h3>${title}</h3>
                        <p>${summary}</p>
                        ${delHtml ? `<div class="case-actions">${delHtml}</div>` : ""}
                    </div>
                </a>
            `;
        }).join("");

        list.innerHTML = html;
    } catch (err) {
        console.error(err);
        list.innerHTML = `<div class="cases-empty">${t("cases.load_fail")}</div>`;
    }
}

function formatCaseDate(ts) {
    if (!ts) return "";
    let d;
    if (typeof ts === "string") {
        d = new Date(ts);
    } else if (ts.toDate) {
        d = ts.toDate();
    } else {
        d = new Date(ts);
    }
    if (isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${yyyy}.${mm}`;
}

async function deleteCase(id) {
    if (!id) return;
    if (!confirm(t("cases.delete_confirm"))) return;
    try {
        // 1. 글 데이터를 불러와 첨부된 이미지 주소 확인
        const docSnap = await getDoc(doc(db, "cases", id));
        if (docSnap.exists()) {
            const data = docSnap.data();
            const images = data.images || [];
            
            // 2. Storage 원본 파일 삭제
            for (const url of images) {
                if(url.includes("firebasestorage")) {
                    try {
                        const fileRef = ref(storage, url);
                        await deleteObject(fileRef);
                    } catch (err) {
                        console.warn("스토리지 이미지 삭제 실패 (이미 지워졌거나 권한 없음):", err);
                    }
                }
            }
        }
        
        // 3. Firestore 게시글 데이터 삭제
        await deleteDoc(doc(db, "cases", id));
        allCasesCache = null;  // 캐시 무효화
        await loadCases();
    } catch (err) {
        console.error(err);
        alert(t("cases.delete_fail"));
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

    // 서버 측 admins 컬렉션으로 재검증 (캐시가 비어있을 수도 있으니 await)
    const adminOk = await verifyIsAdmin(auth.currentUser);
    if (!adminOk) {
        list.innerHTML = `<div class="consults-empty">${t("cm.admin_only")}</div>`;
        if (count) count.textContent = "0";
        return;
    }

    list.innerHTML = `<div class="consults-empty">${t("cm.loading")}</div>`;

    try {
        const q = query(collection(db, "consultations"), orderBy("timestamp", "desc"));
        const snap = await getDocs(q);

        if (snap.empty) {
            list.innerHTML = `<div class="consults-empty">${t("cm.empty")}</div>`;
            if (count) count.textContent = "0";
            return;
        }

        if (count) count.textContent = snap.size;

        const html = [];
        snap.forEach((docSnap) => {
            const d  = docSnap.data();
            const id = docSnap.id;

            const name    = escapeHTML(d.name    || t("cm.no_name"));
            const phone   = escapeHTML(d.phone   || "");
            const email   = escapeHTML(d.email   || "");
            const type    = escapeHTML(translateCategory(d.type    || "기타"));
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
                            <dt>${t("cm.contact")}</dt><dd>${phoneCell}</dd>
                            <dt>${t("cm.email")}</dt><dd>${emailCell}</dd>
                        </dl>
                        <div class="consult-message">${message}</div>
                        <div class="consult-actions">
                            <button class="btn-done ${isDone ? 'is-active' : ''}"
                                    data-action="toggle-done" data-id="${escapeHTML(id)}">
                                ${isDone ? t("cm.mark_undone") : t("cm.mark_done")}
                            </button>
                            <button class="btn-delete"
                                    data-action="delete-consult" data-id="${escapeHTML(id)}">
                                ${t("cm.delete")}
                            </button>
                        </div>
                    </div>
                </div>
            `);
        });

        list.innerHTML = html.join("");
    } catch (err) {
        console.error(err);
        list.innerHTML = `<div class="consults-empty">${t("cm.load_fail")}<br>${escapeHTML(err?.message || '')}</div>`;
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
        alert(t("cm.toggle_fail"));
    }
}

async function deleteConsult(id) {
    if (!id) return;
    if (!confirm(t("cm.delete_confirm"))) return;
    try {
        await deleteDoc(doc(db, "consultations", id));
        await loadConsultations();
    } catch (err) {
        console.error(err);
        alert(t("cm.delete_fail"));
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
            alert(t("ml.err_required"));
            return;
        }

        btn.disabled = true;
        btn.textContent = t("ml.loading");
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
                        ${t("ml.empty")}
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
                const num    = escapeHTML(d.receiptNumber || t("ml.no_num"));
                const date   = escapeHTML(formatDate(d.timestamp));
                const type   = escapeHTML(translateCategory(d.type || "기타"));
                const msg    = nl2br(d.message || "");
                const isDone = !!d.done;
                const status = isDone ? t("ml.status_done") : t("ml.status_pending");
                const statusCls = isDone ? "is-done" : "";

                return `
                    <article class="mylookup-card">
                        <header class="mylookup-card-head">
                            <span class="mylookup-card-num">${num}</span>
                            <span class="mylookup-card-date">${date}</span>
                            <span class="mylookup-card-status ${statusCls}">${status}</span>
                        </header>
                        <p class="mylookup-card-type">${t("ml.field")}${type}</p>
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
                        ${t("ml.err")}
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
        btn.textContent = t("post.uploading");

        const files    = Array.from($("#post-image")?.files || []);
        const title    = $("#post-title-input").value.trim();
        const content  = $("#post-content").value.trim();
        const category = $("#post-category")?.value || "기타";
        const summary  = $("#post-summary")?.value.trim() || "";
        const judgmentDate = $("#post-date")?.value || "";

        if (!title || !content) {
            alert(t("post.err_required"));
            btn.disabled = false; btn.textContent = originalText;
            return;
        }

        try {
            const images = [];
            // 파이어베이스 스토리지에 실제 파일 업로드
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                btn.textContent = `${t("post.upload_img")} ${i + 1}/${files.length}`;
                const safeName = file.name.replace(/[^\w.\-]/g, "_");
                const sRef = ref(storage, `cases/${Date.now()}_${i}_${safeName}`);
                await uploadBytes(sRef, file);
                const url = await getDownloadURL(sRef);
                images.push(url);
            }

            btn.textContent = t("post.saving");
            await addDoc(collection(db, "cases"), {
                title, content, summary, category, judgmentDate,
                images,
                imageUrl: images[0] || null,  // 하위 호환
                timestamp: serverTimestamp()
            });

            alert(t("post.success"));
            postForm.reset();
            closeModal("post-modal");
            allCasesCache = null;  // 캐시 무효화
            await loadCases();
        } catch (err) {
            console.error(err);
            alert(t("post.err_submit") + (err?.message || ""));
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
}

/* ---------- Login (with brute-force protection) ---------- */
const authForm = $("#auth-form");
if (authForm) {
    // 봇 방지 honeypot 설치
    setupHoneypot(authForm);

    authForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = authForm.querySelector('button[type="submit"]');
        const originalText = btn.textContent;

        const email    = $("#auth-email").value.trim();
        const password = $("#auth-password").value;

        // ─── 0. 봇 시그널 확인 ───
        const botReason = checkBotSignals(authForm);
        if (botReason) {
            console.warn("[security] bot blocked:", botReason);
            alert(t("login.bot_blocked"));
            return;
        }

        // ─── 1. 이메일 형식 검증 ───
        if (!isValidEmail(email)) {
            alert(t("login.email_invalid"));
            return;
        }
        if (!password || password.length < 1) {
            alert(t("cons.err_required"));
            return;
        }

        btn.disabled = true;
        btn.textContent = t("login.loading");

        try {
            // ─── 2. 잠금 상태 확인 ───
            const lockStatus = await checkLockStatus(email);
            if (lockStatus.locked) {
                alert(formatLockMessage(lockStatus.remainingMs));
                return;
            }

            // ─── 3. 실제 로그인 시도 ───
            try {
                await signInWithEmailAndPassword(auth, email, password);
                // 성공 → 카운터 리셋
                await resetLoginAttempts(email);
                authForm.reset();
                closeModal("login-modal");
                // honeypot 재설치 (form.reset이 동적 필드는 안 지움)
                BOT.formLoadTime.set(authForm, Date.now());
            } catch (loginErr) {
                console.error("[login] auth failed:", loginErr?.code);
                // ─── 4. 실패 기록 ───
                const result = await recordLoginFailure(email);
                if (result.locked) {
                    alert(formatLockMessage(SEC.LOCK_MS));
                } else {
                    alert(t("login.fail") + "\n" + formatRemainingMessage(result.remaining));
                }
            }
        } catch (err) {
            console.error(err);
            alert(t("login.fail"));
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
            try { await signOut(auth); alert(t("login.logout_done")); }
            catch (err) { console.error(err); }
            break;
        case "delete-case":
            e.preventDefault();
            await deleteCase(target.dataset.id);
            break;
        case "toggle-consult": {
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

/* ---------- Cases filter (cases.html) ---------- */
const casesFilter = $("#cases-filter");
if (casesFilter) {
    casesFilter.addEventListener("click", (e) => {
        const btn = e.target.closest(".filter-btn");
        if (!btn) return;
        const filter = btn.dataset.filter;
        if (!filter) return;

        $$(".filter-btn", casesFilter).forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        currentFilter = filter;
        loadCases();
    });
}

/* ---------- Case detail page (case.html) ---------- */
async function loadCaseDetail() {
    const article = $("#case-article");
    if (!article) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        article.innerHTML = `
            <div class="container container-narrow">
                <div class="case-detail-error">
                    ${t("cases.detail_invalid")}<br>
                    <a href="cases.html" style="color:var(--c-ink); border-bottom:1px solid var(--c-ink); padding-bottom:1px;">${t("cases.back")}</a>
                </div>
            </div>`;
        document.title = t("cases.notfound_title");
        return;
    }

    try {
        const snap = await getDoc(doc(db, "cases", id));
        if (!snap.exists()) {
            article.innerHTML = `
                <div class="container container-narrow">
                    <div class="case-detail-error">
                        ${t("cases.detail_notfound")}<br>
                        <a href="cases.html" style="color:var(--c-ink); border-bottom:1px solid var(--c-ink); padding-bottom:1px;">${t("cases.back")}</a>
                    </div>
                </div>`;
            document.title = t("cases.notfound_title");
            return;
        }

        const d = snap.data();
        const title    = escapeHTML(d.title || t("cases.no_title"));
        const category = escapeHTML(translateCategory(d.category || "기타"));
        const summary  = escapeHTML(d.summary || "");
        const content  = escapeHTML(d.content || "");
        const date     = formatCaseDate(d.judgmentDate || d.timestamp);

        document.title = `${d.title || t("cases.title")} | TANHA LAW OFFICE`;

        let images = [];
        if (Array.isArray(d.images)) images = d.images;
        else if (d.imageUrl) images = [d.imageUrl];

        const imagesHtml = images.length > 0
            ? `<div class="case-detail-images">
                  ${images.map(url => `<img src="${escapeHTML(url)}" alt="${title}" data-action="open-lightbox" loading="lazy">`).join("")}
               </div>`
            : "";

        const isAdmin = isAdminSync();
        const adminHtml = isAdmin
            ? `<div class="case-detail-admin">
                   <button class="delete-btn" data-action="delete-case-detail" data-id="${escapeHTML(id)}" type="button">${t("cases.delete_detail")}</button>
               </div>`
            : "";

        // 자동번역 버튼 (영문 모드일 때만)
        const translateHtml = getLang() === "en"
            ? `<div class="auto-translate-wrap">
                   <button type="button" class="btn-translate"
                           data-action="auto-translate"
                           data-translate-title=".case-detail-title"
                           data-translate-summary=".case-detail-summary"
                           data-translate-target=".case-detail-content">${t("tx.translate")}</button>
                   <span class="auto-translate-note">${t("tx.note")}</span>
               </div>`
            : "";

        article.innerHTML = `
            <div class="container container-narrow">
                <div class="case-detail-back">
                    <a href="cases.html">${t("cases.back_short")}</a>
                </div>
                <div class="case-detail-meta">
                    <span class="case-category">${category}</span>
                    ${date ? `<span>${escapeHTML(date)}</span>` : ""}
                </div>
                <h1 class="case-detail-title">${title}</h1>
                ${summary ? `<p class="case-detail-summary">${summary}</p>` : ""}
                ${translateHtml}
                ${imagesHtml}
                <div class="case-detail-content">${content}</div>
                ${adminHtml}
            </div>
        `;
    } catch (err) {
        console.error(err);
        article.innerHTML = `
            <div class="container container-narrow">
                <div class="case-detail-error">
                    ${t("cases.detail_loadfail")}<br>
                    ${escapeHTML(err?.message || '')}
                </div>
            </div>`;
    }
}

if ($("#case-article")) {
    loadCaseDetail();
}

async function deleteCaseFromDetail(id) {
    if (!id) return;
    if (!confirm(t("cases.delete_confirm"))) return;
    try {
        // Storage 원본 파일 삭제
        const docSnap = await getDoc(doc(db, "cases", id));
        if (docSnap.exists()) {
            const data = docSnap.data();
            const images = data.images || [];
            for (const url of images) {
                if(url.includes("firebasestorage")) {
                    try {
                        const fileRef = ref(storage, url);
                        await deleteObject(fileRef);
                    } catch (err) {
                        console.warn("스토리지 이미지 삭제 실패:", err);
                    }
                }
            }
        }
        
        // Firestore 게시글 삭제
        await deleteDoc(doc(db, "cases", id));
        alert(t("cases.deleted"));
        window.location.href = "cases.html";
    } catch (err) {
        console.error(err);
        alert(t("cases.delete_fail"));
    }
}

/* ---------- Lightbox (case detail images) ---------- */
function openLightbox(src) {
    const lb = $("#lightbox");
    const img = $("#lightbox-img");
    if (!lb || !img) return;
    img.src = src;
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
}
function closeLightbox() {
    const lb = $("#lightbox");
    if (!lb) return;
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
}

document.addEventListener("click", (e) => {
    const target = e.target;

    if (target.matches?.('[data-action="open-lightbox"]')) {
        e.preventDefault();
        openLightbox(target.src);
        return;
    }

    if (target.matches?.('[data-action="close-lightbox"]') ||
        target.closest?.('[data-action="close-lightbox"]')) {
        closeLightbox();
        return;
    }

    const detailDeleteBtn = target.closest?.('[data-action="delete-case-detail"]');
    if (detailDeleteBtn) {
        e.preventDefault();
        deleteCaseFromDetail(detailDeleteBtn.dataset.id);
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
});
/* ---------- Video Control ---------- */
const videoElem = $("#main-video");
const videoBtn = $("#video-control-btn");

if (videoElem && videoBtn) {
    videoBtn.addEventListener("click", () => {
        if (videoElem.paused) {
            videoElem.currentTime = 0;
            videoElem.play();
            videoElem.classList.remove("is-blacked-out");
            videoBtn.textContent = t("hero.pause");
        } else {
            videoElem.pause();
            videoElem.classList.add("is-blacked-out");
            videoBtn.textContent = t("hero.play");
        }
    });
}

/* =========================================================
   Notices (탄하소식 / 법률소식)
   - cases 로직을 평행 구조로 작성
   ========================================================= */
let allNoticesCache = null;
let currentNoticeFilter = "all";

async function loadNotices() {
    const list = $("#notices-list");
    if (!list) return;

    const limit = parseInt(list.dataset.limit || "0", 10);

    try {
        if (!allNoticesCache) {
            const q = query(collection(db, "notices"), orderBy("timestamp", "desc"));
            const snap = await getDocs(q);
            allNoticesCache = [];
            snap.forEach(s => allNoticesCache.push({ id: s.id, ...s.data() }));
        }

        // 필터 적용
        let items = allNoticesCache;
        if (currentNoticeFilter !== "all") {
            items = items.filter(d => (d.category || "탄하소식") === currentNoticeFilter);
        }
        if (limit > 0) items = items.slice(0, limit);

        if (items.length === 0) {
            list.innerHTML = `<div class="notices-empty">${
                currentNoticeFilter === "all"
                    ? t("notice.empty_all")
                    : t("notice.empty_filtered")
            }</div>`;
            return;
        }

        const isAdmin = isAdminSync();
        const html = items.map(d => {
            const id       = d.id;
            const title    = escapeHTML(d.title || t("cases.no_title"));
            const category = escapeHTML(translateCategory(d.category || "탄하소식"));
            const summary  = escapeHTML(d.summary || (d.content ? d.content.slice(0, 100) : ""));
            const date     = formatCaseDate(d.postDate || d.timestamp);

            let firstImg = null;
            if (Array.isArray(d.images) && d.images.length > 0) firstImg = d.images[0];
            else if (d.imageUrl) firstImg = d.imageUrl;

            const imgHtml = firstImg
                ? `<img src="${escapeHTML(firstImg)}" alt="${title}" class="notice-img" loading="lazy">`
                : `<div class="notice-no-img">${t("common.no_image")}</div>`;

            const delHtml = isAdmin
                ? `<button class="delete-btn" data-action="delete-notice" data-id="${escapeHTML(id)}" type="button">${t("notice.delete")}</button>`
                : "";

            return `
                <a href="notice.html?id=${encodeURIComponent(id)}" class="notice-card">
                    ${imgHtml}
                    <div class="notice-body">
                        <div class="notice-meta">
                            <span class="notice-category">${category}</span>
                            ${date ? `<span>${escapeHTML(date)}</span>` : ""}
                        </div>
                        <h3>${title}</h3>
                        <p>${summary}</p>
                        ${delHtml ? `<div class="notice-actions">${delHtml}</div>` : ""}
                    </div>
                </a>
            `;
        }).join("");

        list.innerHTML = html;
    } catch (err) {
        console.error(err);
        list.innerHTML = `<div class="notices-empty">${t("notice.load_fail")}</div>`;
    }
}

async function deleteNotice(id) {
    if (!id) return;
    if (!confirm(t("notice.delete_confirm"))) return;
    try {
        const docSnap = await getDoc(doc(db, "notices", id));
        if (docSnap.exists()) {
            const data = docSnap.data();
            const images = data.images || [];
            for (const url of images) {
                if (url.includes("firebasestorage")) {
                    try {
                        const fileRef = ref(storage, url);
                        await deleteObject(fileRef);
                    } catch (err) {
                        console.warn("스토리지 이미지 삭제 실패:", err);
                    }
                }
            }
        }
        await deleteDoc(doc(db, "notices", id));
        allNoticesCache = null;
        await loadNotices();
    } catch (err) {
        console.error(err);
        alert(t("cases.delete_fail"));
    }
}

/* ---------- Notices filter ---------- */
const noticesFilter = $("#notices-filter");
if (noticesFilter) {
    noticesFilter.addEventListener("click", (e) => {
        const btn = e.target.closest(".filter-btn");
        if (!btn) return;
        const filter = btn.dataset.filter;
        if (!filter) return;

        $$(".filter-btn", noticesFilter).forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        currentNoticeFilter = filter;
        loadNotices();
    });
}

/* ---------- Notice post (등록) ---------- */
const noticePostForm = $("#notice-post-form");
if (noticePostForm) {
    noticePostForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = noticePostForm.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = t("post.uploading");

        const files    = Array.from($("#notice-image")?.files || []);
        const title    = $("#notice-title-input").value.trim();
        const content  = $("#notice-content").value.trim();
        const category = $("#notice-category")?.value || "탄하소식";
        const summary  = $("#notice-summary")?.value.trim() || "";
        const postDate = $("#notice-date")?.value || "";

        if (!title || !content) {
            alert(t("post.err_required"));
            btn.disabled = false; btn.textContent = originalText;
            return;
        }

        try {
            const images = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                btn.textContent = `${t("post.upload_img")} ${i + 1}/${files.length}`;
                const safeName = file.name.replace(/[^\w.\-]/g, "_");
                const sRef = ref(storage, `notices/${Date.now()}_${i}_${safeName}`);
                await uploadBytes(sRef, file);
                const url = await getDownloadURL(sRef);
                images.push(url);
            }

            btn.textContent = t("post.saving");
            await addDoc(collection(db, "notices"), {
                title, content, summary, category, postDate,
                images,
                imageUrl: images[0] || null,
                timestamp: serverTimestamp()
            });

            alert(t("notice.post_success"));
            noticePostForm.reset();
            closeModal("notice-post-modal");
            allNoticesCache = null;
            await loadNotices();
        } catch (err) {
            console.error(err);
            alert(t("post.err_submit") + (err?.message || ""));
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
}

/* ---------- Notice detail page ---------- */
async function loadNoticeDetail() {
    const article = $("#notice-article");
    if (!article) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        article.innerHTML = `
            <div class="container container-narrow">
                <div class="notice-detail-error">
                    ${t("notice.detail_invalid")}<br>
                    <a href="notices.html" style="color:var(--c-ink); border-bottom:1px solid var(--c-ink); padding-bottom:1px;">${t("notice.back")}</a>
                </div>
            </div>`;
        document.title = t("notice.notfound_title");
        return;
    }

    try {
        const snap = await getDoc(doc(db, "notices", id));
        if (!snap.exists()) {
            article.innerHTML = `
                <div class="container container-narrow">
                    <div class="notice-detail-error">
                        ${t("notice.detail_notfound")}<br>
                        <a href="notices.html" style="color:var(--c-ink); border-bottom:1px solid var(--c-ink); padding-bottom:1px;">${t("notice.back")}</a>
                    </div>
                </div>`;
            document.title = t("notice.notfound_title");
            return;
        }

        const d = snap.data();
        const title    = escapeHTML(d.title || t("cases.no_title"));
        const category = escapeHTML(translateCategory(d.category || "탄하소식"));
        const summary  = escapeHTML(d.summary || "");
        const content  = escapeHTML(d.content || "");
        const date     = formatCaseDate(d.postDate || d.timestamp);

        document.title = `${d.title || t("notice.title")} | TANHA LAW OFFICE`;

        let images = [];
        if (Array.isArray(d.images)) images = d.images;
        else if (d.imageUrl) images = [d.imageUrl];

        const imagesHtml = images.length > 0
            ? `<div class="notice-detail-images">
                  ${images.map(url => `<img src="${escapeHTML(url)}" alt="${title}" data-action="open-lightbox" loading="lazy">`).join("")}
               </div>`
            : "";

        const isAdmin = isAdminSync();
        const adminHtml = isAdmin
            ? `<div class="notice-detail-admin">
                   <button class="delete-btn" data-action="delete-notice-detail" data-id="${escapeHTML(id)}" type="button">${t("notice.delete_detail")}</button>
               </div>`
            : "";

        const translateHtml = getLang() === "en"
            ? `<div class="auto-translate-wrap">
                   <button type="button" class="btn-translate"
                           data-action="auto-translate"
                           data-translate-title=".notice-detail-title"
                           data-translate-summary=".notice-detail-summary"
                           data-translate-target=".notice-detail-content">${t("tx.translate")}</button>
                   <span class="auto-translate-note">${t("tx.note")}</span>
               </div>`
            : "";

        article.innerHTML = `
            <div class="container container-narrow">
                <div class="notice-detail-back">
                    <a href="notices.html">${t("notice.back_short")}</a>
                </div>
                <div class="notice-detail-meta">
                    <span class="notice-category">${category}</span>
                    ${date ? `<span>${escapeHTML(date)}</span>` : ""}
                </div>
                <h1 class="notice-detail-title">${title}</h1>
                ${summary ? `<p class="notice-detail-summary">${summary}</p>` : ""}
                ${translateHtml}
                ${imagesHtml}
                <div class="notice-detail-content">${content}</div>
                ${adminHtml}
            </div>
        `;
    } catch (err) {
        console.error(err);
        article.innerHTML = `
            <div class="container container-narrow">
                <div class="notice-detail-error">
                    ${t("notice.detail_loadfail")}<br>
                    ${escapeHTML(err?.message || '')}
                </div>
            </div>`;
    }
}

if ($("#notice-article")) {
    loadNoticeDetail();
}

async function deleteNoticeFromDetail(id) {
    if (!id) return;
    if (!confirm(t("notice.delete_confirm"))) return;
    try {
        const docSnap = await getDoc(doc(db, "notices", id));
        if (docSnap.exists()) {
            const data = docSnap.data();
            const images = data.images || [];
            for (const url of images) {
                if (url.includes("firebasestorage")) {
                    try {
                        const fileRef = ref(storage, url);
                        await deleteObject(fileRef);
                    } catch (err) {
                        console.warn("스토리지 이미지 삭제 실패:", err);
                    }
                }
            }
        }
        await deleteDoc(doc(db, "notices", id));
        alert(t("cases.deleted"));
        window.location.href = "notices.html";
    } catch (err) {
        console.error(err);
        alert(t("cases.delete_fail"));
    }
}

/* ---------- Notice click delegation (action 추가) ---------- */
document.addEventListener("click", async (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;

    switch (action) {
        case "open-notice-post":
            e.preventDefault();
            openModal("notice-post-modal");
            break;
        case "delete-notice":
            e.preventDefault();
            await deleteNotice(target.dataset.id);
            break;
        case "delete-notice-detail":
            e.preventDefault();
            await deleteNoticeFromDetail(target.dataset.id);
            break;
        case "auto-translate":
            e.preventDefault();
            await toggleAutoTranslate(target);
            break;
    }
});

/* ---------- Notice list reveal target ---------- */
$$(".notices-grid").forEach(el => {
    el.classList.add("reveal");
    if (typeof io !== "undefined") io.observe(el);
});
