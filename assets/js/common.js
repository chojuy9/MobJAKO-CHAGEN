/**
 * common.js - 판타지 툴킷의 공통 자바스크립트 함수
 * 페이지 간에 공유되는 유틸리티 함수들을 포함합니다
 */

/**
 * 네비게이션 메뉴 초기화 함수
 */
function initializeNavigation() {
    // 모바일 메뉴 토글 버튼 클릭 이벤트
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileMenu && navMenu) {
        // 햄버거 메뉴 클릭 시 메뉴 표시/숨김 전환
        mobileMenu.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
        
        // 창 크기 변경 시 모바일 메뉴 상태 초기화
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                navMenu.classList.remove('active');
            }
        });
    }
    
    // 네비게이션 링크 경로 업데이트
    updateNavigationLinks();
    
    // 현재 활성화된 메뉴 항목 표시하기
    highlightCurrentPage();
}

/**
 * 네비게이션 링크 경로를 현재 환경에 맞게 업데이트합니다.
 */
function updateNavigationLinks() {
    const basePath = getBasePath();
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        // 이미 절대 URL인 경우 무시
        if (href.startsWith('http') || href.startsWith('https')) return;
        
        // '/MobJAKO-CHAGEN' 접두사를 제거하고 basePath 추가
        let newHref = href.replace(/^\/MobJAKO-CHAGEN/, '');
        // 맨 앞의 슬래시 제거
        newHref = newHref.replace(/^\//, '');
        // 새 경로 설정
        link.setAttribute('href', basePath + newHref);
    });
}

/**
 * 현재 페이지 URL을 확인하여 해당하는 메뉴 항목을 강조 표시합니다.
 * 이 함수는 URL 경로를 확인하고 일치하는 메뉴 링크에 'active' 클래스를 추가합니다.
 */
function highlightCurrentPage() {
    // 현재 페이지 경로 가져오기
    const currentPath = window.location.pathname;
    
    // 모든 메뉴 링크 요소 가져오기
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // 모든 링크에서 'active' 클래스 제거
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        // 링크 경로와 현재 경로 비교
        const linkPath = link.getAttribute('href');
        
        // 정확히 일치하거나, 현재 경로가 링크 경로를 포함하면서 홈페이지 링크가 아니면 활성화
        if (linkPath === currentPath || 
            (currentPath.includes(linkPath) && 
             linkPath !== '/' && 
             linkPath !== '/index.html')) {
            // 일치하는 링크에 'active' 클래스 추가
            link.classList.add('active');
        }
    });
    
    // 홈 페이지 특별 처리 (정확히 일치할 경우에만)
    if (currentPath === '/' || currentPath === '/index.html') {
        const homeLink = document.querySelector('.nav-links a[href="/"]') || 
                         document.querySelector('.nav-links a[href="/index.html"]');
        if (homeLink) homeLink.classList.add('active');
    }
}

/**
 * 경로 감지 함수 - 데이터 파일을 로드할 때 적절한 경로를 반환합니다.
 * - GitHub Pages, 로컬 개발 환경 등에 따라 적절한 경로를 제공합니다.
 */
function getBasePath() {
    // 현재 URL 정보 가져오기
    const currentHost = window.location.hostname;
    const currentPath = window.location.pathname;
    
    console.log('현재 호스트:', currentHost);
    console.log('현재 경로:', currentPath);
    
    // GitHub Pages인 경우 특별 처리 (username.github.io/reponame 형태)
    if (currentHost.includes('github.io')) {
        // GitHub Pages 주소 형식 처리
        const pathParts = currentPath.split('/').filter(part => part); // 빈 문자열 제거
        
        // 저장소 이름이 포함된 경로 구성
        if (pathParts.length > 0) {
            const repoName = pathParts[0]; // 첫 번째 경로 부분이 저장소 이름
            console.log('감지된 저장소 이름:', repoName);
            return `/${repoName}/`;
        }
        
        return '/'; // 루트 경로
    }
    
    // 로컬 환경이나 다른 웹 서버인 경우
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
        return '/'; // 루트 경로 사용
    }
    
    // 그 외 일반 웹 서버 경우
    return '/';
}

// 페이지 로드 시 자동으로 네비게이션 초기화
document.addEventListener('DOMContentLoaded', initializeNavigation);
