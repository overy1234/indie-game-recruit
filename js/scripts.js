/*!
* Start Bootstrap - Heroic Features v5.0.6 (https://startbootstrap.com/template/heroic-features)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-heroic-features/blob/master/LICENSE)
*/
// This file is intentionally blank
// Use this file to add JavaScript to your project

// API 엔드포인트
const API_URL = 'https://indie-game-recruit.onrender.com/api';  // 나중에 Render.com에 배포할 백엔드 URL

// DOM 요소
const postList = document.getElementById('postList');
const recruitForm = document.getElementById('recruitForm');
const submitPost = document.getElementById('submitPost');
const searchInput = document.querySelector('input[type="search"]');
const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

// 게시글 목록 렌더링
function renderPosts(posts) {
    postList.innerHTML = posts.map(post => `
        <div class="col-lg-6 col-xxl-4 mb-5">
            <div class="card h-100">
                ${post.imageUrl ? 
                    `<img src="${post.imageUrl}" class="card-img-top" alt="프로젝트 이미지" style="height: 200px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/400x200?text=이미지+없음'">` :
                    `<div class="bg-secondary" style="height: 200px; display: flex; align-items: center; justify-content: center; color: white;">이미지 없음</div>`
                }
                <div class="card-body">
                    <h5 class="card-title">${post.projectTitle}</h5>
                    <span class="badge bg-primary mb-2">${post.recruitPosition}</span>
                    <p class="card-text">${post.description.substring(0, 100)}${post.description.length > 100 ? '...' : ''}</p>
                    <hr>
                    <p class="small mb-0">연락처: ${post.contactInfo}</p>
                    <p class="small text-muted">작성일: ${new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// 게시글 목록 불러오기
async function loadPosts(position = '', search = '') {
    try {
        const params = new URLSearchParams();
        if (position) params.append('position', position);
        if (search) params.append('search', search);
        
        const response = await fetch(`${API_URL}/posts?${params}`);
        const posts = await response.json();
        renderPosts(posts);
    } catch (err) {
        console.error('게시글 로딩 실패:', err);
        alert('게시글을 불러오는데 실패했습니다.');
    }
}

// 게시글 작성
submitPost.addEventListener('click', async () => {
    const formData = new FormData();
    
    // 폼 데이터 수집
    formData.append('projectTitle', document.getElementById('projectTitle').value);
    formData.append('recruitPosition', document.getElementById('recruitPosition').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('requirements', document.getElementById('requirements').value);
    formData.append('contactInfo', document.getElementById('contactInfo').value);
    
    const projectImage = document.getElementById('projectImage').files[0];
    if (projectImage) {
        formData.append('projectImage', projectImage);
    }
    
    try {
        const response = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '게시글 작성 실패');
        }
        
        const result = await response.json();
        alert('게시글이 성공적으로 작성되었습니다.');
        
        // 모달 닫기 및 폼 초기화
        const modal = bootstrap.Modal.getInstance(document.getElementById('writePostModal'));
        modal.hide();
        recruitForm.reset();
        
        // 게시글 목록 새로고침
        loadPosts();
    } catch (err) {
        console.error('게시글 작성 실패:', err);
        alert('게시글 작성에 실패했습니다: ' + err.message);
    }
});

// 검색 기능
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const activePosition = document.querySelector('.navbar-nav .nav-link.active').textContent;
        loadPosts(activePosition === '전체' ? '' : activePosition, e.target.value);
    }, 300);
});

// 네비게이션 필터
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        loadPosts(link.textContent === '전체' ? '' : link.textContent, searchInput.value);
    });
});

// 데이터베이스 초기화
document.getElementById('resetButton').addEventListener('click', async () => {
    if (!confirm('정말로 모든 게시글을 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/reset`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('데이터베이스 초기화 실패');
        }
        
        alert('모든 게시글이 삭제되었습니다.');
        loadPosts(); // 목록 새로고침
    } catch (err) {
        console.error('초기화 실패:', err);
        alert('데이터베이스 초기화에 실패했습니다.');
    }
});

// 초기 게시글 로딩
loadPosts();