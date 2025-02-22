// API 엔드포인트
const API_URL = 'https://port-0-indie-game-recruit-m7fplz478a553227.sel4.cloudtype.app/api';

// URL에서 게시글 ID 가져오기
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

// 게시글 상세 정보 로드
async function loadPostDetails() {
    try {
        const response = await fetch(`${API_URL}/posts/${postId}`);
        if (!response.ok) {
            throw new Error('게시글을 찾을 수 없습니다.');
        }
        
        const post = await response.json();
        
        // 이미지 설정
        const postImage = document.getElementById('postImage');
        if (post.imageUrl) {
            postImage.style.backgroundImage = `url(${post.imageUrl})`;
        } else {
            postImage.style.backgroundImage = 'url(https://via.placeholder.com/800x400?text=이미지+없음)';
        }
        
        // 텍스트 정보 설정
        document.getElementById('postTitle').textContent = post.projectTitle;
        document.getElementById('postPosition').textContent = post.recruitPosition;
        document.getElementById('postDescription').textContent = post.description;
        document.getElementById('postRequirements').textContent = post.requirements || '별도 요건 없음';
        document.getElementById('postContact').textContent = post.contactInfo;
        document.getElementById('postDate').textContent = `작성일: ${new Date(post.createdAt).toLocaleDateString()}`;
        
        // SNS 링크 처리
        const snsLinkContainer = document.getElementById('snsLinkContainer');
        const snsLink = document.getElementById('postSnsLink');
        if (post.snsLink) {
            snsLink.href = post.snsLink;
            snsLinkContainer.style.display = 'block';
        } else {
            snsLinkContainer.style.display = 'none';
        }
        
        // 페이지 제목 설정
        document.title = `${post.projectTitle} - 인디게임 개발자 모집`;
    } catch (err) {
        console.error('게시글 로드 실패:', err);
        alert('게시글을 불러오는데 실패했습니다.');
        window.location.href = 'index.html';
    }
}

// 페이지 로드 시 게시글 정보 불러오기
loadPostDetails(); 