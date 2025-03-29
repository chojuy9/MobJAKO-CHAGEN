/**
 * 네비게이션 헤더를 로드하는 함수
 * 이 스크립트는 모든 페이지에서 공통 헤더를 로드하기 위해 사용됩니다.
 */
document.addEventListener('DOMContentLoaded', function() {
    // 헤더를 삽입할 위치를 찾습니다.
    // 'header-placeholder'라는 ID를 가진 요소가 있으면 그곳에 삽입합니다.
    // 없으면 body의 첫 번째 자식 요소 앞에 삽입합니다.
    const headerPlaceholder = document.getElementById('header-placeholder');
    
    // 경로 감지 함수 호출 - common.js 파일에서 가져온 함수
    const basePath = getBasePath();
    console.log('헤더 로드 경로:', basePath);
    
    // 네비게이션 헤더를 서버에서 가져옵니다.
    fetch(basePath + 'assets/includes/header.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('네비게이션 헤더를 로드하는데 실패했습니다: ' + response.status);
            }
            return response.text();
        })
        .then(html => {
            if (headerPlaceholder) {
                // placeholder가 있으면 그 안에 삽입
                headerPlaceholder.innerHTML = html;
            } else {
                // placeholder가 없으면 body의 첫 요소 앞에 삽입
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                document.body.insertBefore(tempDiv.firstElementChild, document.body.firstChild);
            }
            
            // 네비게이션 초기화 함수 호출 (common.js에서 정의한 함수)
            if (typeof initializeNavigation === 'function') {
                initializeNavigation();
            }
        })
        .catch(error => {
            console.error('헤더 로드 오류:', error);
            // 오류 발생 시 추가 디버깅 정보 표시
            if (headerPlaceholder) {
                headerPlaceholder.innerHTML = `
                    <div class="error-message">
                        헤더를 로드하는 중 오류가 발생했습니다:<br>
                        ${error.message}<br>
                        시도한 경로: ${basePath}assets/includes/header.html
                    </div>
                `;
            }
        });
});
