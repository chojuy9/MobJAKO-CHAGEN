/**
 * translator-options-loader.js - 번역 옵션 모듈 로더
 * 사용자 사전 및 커스텀 프롬프트 옵션 UI를 동적으로 로드합니다.
 */

document.addEventListener('DOMContentLoaded', function() {
    // 번역 옵션을 로드할 컨테이너 요소 찾기
    const optionsContainer = document.getElementById('translation-options-container');
    
    if (!optionsContainer) {
        console.error('번역 옵션을 위한 컨테이너를 찾을 수 없습니다.');
        return;
    }
    
    // 경로 감지 함수 호출 - common.js 파일에서 가져온 함수
    const basePath = getBasePath();
    console.log('번역 옵션 로드 경로:', basePath);
    
    // 번역 옵션 HTML 파일 로드
    fetch(basePath + 'assets/includes/translation-options.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('번역 옵션을 로드하는데 실패했습니다: ' + response.status);
            }
            return response.text();
        })
        .then(html => {
            // 컨테이너에 번역 옵션 HTML 삽입
            optionsContainer.innerHTML = html;
            
            // 탭 기능 초기화
            initTabHandlers();
        })
        .catch(error => {
            console.error('번역 옵션 로드 오류:', error);
            // 오류 발생 시 기본 메시지 표시
            optionsContainer.innerHTML = `
                <div class="error-message">
                    번역 옵션을 로드하는 중 오류가 발생했습니다:<br>
                    ${error.message}<br>
                    시도한 경로: ${basePath}assets/includes/translation-options.html
                </div>
            `;
        });
});

/**
 * 탭 전환 기능 초기화
 */
function initTabHandlers() {
    // 탭 버튼 요소 가져오기
    const tabButtons = document.querySelectorAll('.tab-button');
    
    // 각 탭 버튼에 클릭 이벤트 리스너 추가
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 활성화된 탭 클래스 제거
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // 모든 탭 콘텐츠 숨기기
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // 클릭한 탭 활성화
            this.classList.add('active');
            
            // 해당 탭 콘텐츠 표시
            const targetId = this.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}
