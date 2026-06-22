window.onload = function(){
    setTimeout(() => {
        const loader = document.getElementById("loader");
        if(loader){
            loader.style.opacity = "0";
            setTimeout(() => {
                loader.style.display = "none";
            }, 500);
        }
    }, 1200);

    AOS.init();
    updateSlider();
    loadSiteData();

    // secret admin unlock: klik brand 15x
    try{
        const brandBtn = document.getElementById('brandAdminBtn');
        const adminItem = document.getElementById('adminMenuItem');
        let clicks = 0;
        if(brandBtn && adminItem){
            brandBtn.addEventListener('click', (e) => {
                e.preventDefault();
                clicks++;
                if(clicks >= 15){
                    adminItem.style.display = 'block';
                }
            });
        }
    }catch(_){ /* ignore */ }
};



/* ================= PROJECT SLIDER ================= */
let currentSlide = 0;
let totalSlides = 6;


function updateSlider(){
    const track = document.getElementById("sliderTrack");
    if(!track) return;

    const firstSlide = track.children[0];
    const slideWidth = firstSlide ? firstSlide.offsetWidth : 0;

    currentTranslate = -(currentSlide * slideWidth);
    prevTranslate = currentTranslate;
    track.style.transform = "translateX(" + currentTranslate + "px)";
}

function nextSlide(){
    if(currentSlide < totalSlides - 1){
        currentSlide++;
        updateSlider();
    }
}

function prevSlide(){
    if(currentSlide > 0){
        currentSlide--;
        updateSlider();
    }
}

window.addEventListener("resize", updateSlider);

/* ================= DRAG SLIDER ================= */
let isDragging = false;
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID;
let dragMoved = false;

const sliderContainer = document.querySelector(".slider-container");
const sliderTrack = document.getElementById("sliderTrack");

if(sliderContainer && sliderTrack){
    sliderContainer.addEventListener("mousedown", dragStart);
    sliderContainer.addEventListener("touchstart", dragStart);

    sliderContainer.addEventListener("mouseup", dragEnd);
    sliderContainer.addEventListener("mouseleave", dragEnd);
    sliderContainer.addEventListener("touchend", dragEnd);

    sliderContainer.addEventListener("mousemove", drag);
    sliderContainer.addEventListener("touchmove", drag);

    sliderContainer.addEventListener("contextmenu", e => e.preventDefault());
}

function dragStart(e){
    isDragging = true;
    dragMoved = false;
    startPos = getPositionX(e);
    animationID = requestAnimationFrame(animation);
    sliderContainer.style.cursor = "grabbing";
    sliderTrack.style.transition = "none";
}

function drag(e){
    if(!isDragging) return;
    const currentPosition = getPositionX(e);
    const diff = currentPosition - startPos;
    if(Math.abs(diff) > 5){
        dragMoved = true;
    }
    currentTranslate = prevTranslate + diff;
}

function dragEnd(){
    isDragging = false;
    cancelAnimationFrame(animationID);
    sliderContainer.style.cursor = "grab";
    sliderTrack.style.transition = "transform 0.4s ease";

    const slideWidth = sliderTrack.children[0] ? sliderTrack.children[0].offsetWidth : 0;
    const movedBy = currentTranslate - prevTranslate;

    if(movedBy < -50 && currentSlide < totalSlides - 1){
        currentSlide++;
    } else if(movedBy > 50 && currentSlide > 0){
        currentSlide--;
    }

    updateSlider();
}

function getPositionX(e){
    return e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
}

function animation(){
    if(isDragging){
        sliderTrack.style.transform = "translateX(" + currentTranslate + "px)";
        requestAnimationFrame(animation);
    }
}

function setSliderPosition(){
    sliderTrack.style.transform = "translateX(" + currentTranslate + "px)";
}

/* ================= PROJECT DATA (loaded from backend) ================= */
let projectData = [];

let siteDataLoaded = false;
const ADMIN_BACKEND_BASE = 'http://localhost:3000';

async function loadSiteData(){
    try{
        const res = await fetch(ADMIN_BACKEND_BASE + '/api/site-data?ts=' + Date.now(), { cache: 'no-store' });
        if(!res.ok) throw new Error('Failed to load site data');
        const data = await res.json();
        siteDataLoaded = true;
        applySiteData(data);
        projectData = Array.isArray(data.projects) ? data.projects : [];
        setupProjectsSlider();
    }catch(e){
        console.error(e);
    }
}


function applySiteData(data){
    if(!data) return;

    // HERO text
    const heroName = document.querySelector('.hero h1 span');
    if(heroName && data.hero?.name) heroName.textContent = data.hero.name;

    const heroRole = document.querySelector('.hero p');
    if(heroRole && data.hero?.role) heroRole.textContent = data.hero.role;

    // HERO skills chips
    const skillsWrap = document.querySelector('.hero .skills');
    if(skillsWrap && Array.isArray(data.hero?.skills)){
        skillsWrap.innerHTML = '';
        data.hero.skills.forEach((s) => {
            const div = document.createElement('div');
            div.className = 'skill';
            div.textContent = s;
            skillsWrap.appendChild(div);
        });
    }


    // HERO description (card-box)
    const heroDesc = document.querySelector('.card-box p');
    if(heroDesc && data.hero?.descriptionHtml) heroDesc.innerHTML = data.hero.descriptionHtml;


    // ABOUT: replace About paragraph, What I Do paragraph, and stats labels
    const aboutCards = document.querySelectorAll('#about .col-card');
    if(aboutCards && aboutCards.length >= 3){
        const aboutP = aboutCards[0].querySelector('p');
        if(aboutP && data.about?.aboutParagraphHtml) aboutP.innerHTML = data.about.aboutParagraphHtml;

        const statsBox = aboutCards[1];
        if(statsBox && Array.isArray(data.about?.stats)){
            const statItems = statsBox.querySelectorAll('.stat-item');
            data.about.stats.forEach((s, i) => {
                if(statItems[i]){
                    const icon = statItems[i].querySelector('i');
                    if(icon && s.icon) icon.className = 'fas ' + s.icon;
                    const span = statItems[i].querySelector('span');
                    if(span && s.label) span.textContent = s.label;
                }
            });
        }

        const whatP = aboutCards[2].querySelector('p');
        if(whatP && data.about?.whatIdoParagraphHtml) whatP.innerHTML = data.about.whatIdoParagraphHtml;
    }

    // FOOTER
    const footerH3 = document.querySelector('.footer h3');
    const footerRole = document.querySelector('.footer p');
    if(footerH3 && data.footer?.name) footerH3.textContent = data.footer.name;
    if(footerRole && data.footer?.role) footerRole.textContent = data.footer.role;

    const copyEl = document.querySelector('.footer .copy');
    if(copyEl && data.footer?.copy) copyEl.textContent = data.footer.copy;
}

function setupProjectsSlider(){
    const track = document.getElementById('sliderTrack');
    if(!track) return;
    track.innerHTML = '';


    const slides = projectData || [];
    slides.forEach((p, idx) => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide.setAttribute('onclick', `openProjectModal(${idx})`);
        slide.innerHTML = `
            <div class="card">
                <h3>${escapeHtml(p.title || '')}</h3>
                <p>
                    ${escapeHtml(p.desc || '').replaceAll('\n','<br>')}
                    <br><br>
                    <b>✔</b> ${escapeHtml((p.features && p.features[0]) ? p.features[0] : 'Feature')}
                </p>
            </div>
        `;
        track.appendChild(slide);
    });

    totalSlides = Math.max(slides.length, 1);
    currentSlide = 0;
    prevTranslate = 0;
    currentTranslate = 0;
    updateSlider();
}

function escapeHtml(str){
    return String(str)
        .replaceAll('&','&amp;')
        .replaceAll('<','<')
        .replaceAll('>','>')
        .replaceAll('"','"')
        .replaceAll("'",'&#039;');
}

function openProjectModal(index){
    if(dragMoved){
        dragMoved = false;
        return;
    }

    const data = projectData[index];
    if(!data) return;

    document.getElementById("projectModalTitle").innerText = data.title;

    let featuresHtml = "";
    for(let i = 0; i < data.features.length; i++){
        featuresHtml += "<li>" + data.features[i] + "</li>";
    }

    document.getElementById("projectModalBody").innerHTML =
        "<p><b>Tech Stack:</b> " + data.stack + "</p>" +
        "<p style='margin-top:12px;'>" + data.desc + "</p>" +
        "<ul>" + featuresHtml + "</ul>";

    document.getElementById("projectModal").classList.add("show");
}

function closeProjectModal(){
    document.getElementById("projectModal").classList.remove("show");
}

function toggleMenu(){
    const menu = document.getElementById("navMenu");
    if(menu) menu.classList.toggle("active");
}

function openCV(){
    const modal = document.getElementById("cvModal");
    if(modal) modal.classList.add("show");
}

function closeCV(){
    const modal = document.getElementById("cvModal");
    if(modal) modal.classList.remove("show");
}

window.onclick = function(e){
    // CV modal / Project modal close

    const cvModal = document.getElementById("cvModal");
    const projectModal = document.getElementById("projectModal");
    if(e.target === cvModal){
        cvModal.classList.remove("show");
    }
    if(e.target === projectModal){
        projectModal.classList.remove("show");
    }
};

function downloadCV(){
    const link = document.createElement("a");
    link.href = "CV-Nabil-Al-Kaysan.pdf";
    link.download = "CV-Nabil-Al-Kaysan.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ================= CONTACT (fallback) =================
// index.html memanggil kirimEmail() via onclick.
// Di repository sebelumnya function ini tidak ada. Ini agar tombol Send tidak error.
function kirimEmail(){
    const statusMsg = document.getElementById('statusMsg');
    const namaEl = document.getElementById('nama');
    const emailEl = document.getElementById('email');
    const pesanEl = document.getElementById('pesan');

    if(!statusMsg) return;

    const nama = (namaEl && namaEl.value ? namaEl.value.trim() : '');
    const email = (emailEl && emailEl.value ? emailEl.value.trim() : '');
    const pesan = (pesanEl && pesanEl.value ? pesanEl.value.trim() : '');

    if(!nama || !email || !pesan){
        statusMsg.textContent = 'Please fill name, email, and message.';
        return;
    }

    statusMsg.textContent = 'Message saved locally (demo).';

    // Demo: simpan draft ke localStorage (tanpa kirim email sungguhan)
    try{
        localStorage.setItem('contactDraft', JSON.stringify({nama, email, pesan, time: Date.now()}));
    }catch(err){
        // ignore
    }
}

