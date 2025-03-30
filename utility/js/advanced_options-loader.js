/**
 * advanced-options-loader.js - 고급 설정 모듈 로더
 * 고급 설정 섹션을 동적으로 로드하고 관련 기능을 초기화합니다.
 */

document.addEventListener('DOMContentLoaded', function() {
    // 고급 설정을 로드할 컨테이너 요소 찾기
    const advancedOptionsContainer = document.getElementById('advanced-options-container');
    
    if (!advancedOptionsContainer) {
        console.error('고급 설정을 위한 컨테이너를 찾을 수 없습니다.');
        return;
    }
    
    // 경로 감지 함수 호출 - common.js 파일에서 가져온 함수
    const basePath = getBasePath();
    console.log('고급 설정 로드 경로:', basePath);
    
    // 고급 설정 HTML 파일 로드
    fetch(basePath + 'assets/includes/advanced-options.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('고급 설정을 로드하는데 실패했습니다: ' + response.status);
            }
            return response.text();
        })
        .then(html => {
            // 컨테이너에 고급 설정 HTML 삽입
            advancedOptionsContainer.innerHTML = html;
            
            // 로드 후 이벤트 리스너 및 기능 초기화
            initAdvancedOptions();
        })
        .catch(error => {
            console.error('고급 설정 로드 오류:', error);
            // 오류 발생 시 기본 메시지 표시
            advancedOptionsContainer.innerHTML = `
                <div class="error-message">
                    고급 설정을 로드하는 중 오류가 발생했습니다:<br>
                    ${error.message}<br>
                    시도한 경로: ${basePath}assets/includes/advanced-options.html
                </div>
            `;
        });
});

/**
 * 고급 설정 관련 기능 초기화 함수
 */
function initAdvancedOptions() {
    // 토글 버튼 및 고급 설정 영역 요소 찾기
    const toggleButton = document.getElementById('toggle-advanced-options');
    const advancedOptions = document.getElementById('advanced-options');
    
    if (!toggleButton || !advancedOptions) {
        console.error('고급 설정 요소를 찾을 수 없습니다.');
        return;
    }
    
    // 기본 상태 설정 (초기에 보이게)
    advancedOptions.style.display = 'block';
    toggleButton.innerHTML = '<i class="fas fa-cog"></i> 고급 설정 숨기기';
    
    // 토글 버튼 클릭 이벤트 리스너
    toggleButton.addEventListener('click', function() {
        toggleAdvancedOptions(advancedOptions, toggleButton);
    });
    
    // 슬라이더 초기화
    initSliders();
    
    // 매개변수 리셋 버튼 초기화
    const resetButton = document.getElementById('reset-parameters');
    if (resetButton) {
        resetButton.addEventListener('click', resetParameters);
    }
}

/**
 * 고급 설정 토글 함수
 * @param {HTMLElement} optionsElement - 고급 설정 컨테이너 요소
 * @param {HTMLElement} buttonElement - 토글 버튼 요소
 */
function toggleAdvancedOptions(optionsElement, buttonElement) {
    if (optionsElement.style.display === 'none') {
        // 보이게 설정
        optionsElement.style.display = 'block';
        buttonElement.innerHTML = '<i class="fas fa-cog"></i> 고급 설정 숨기기';
    } else {
        // 숨기게 설정
        optionsElement.style.display = 'none';
        buttonElement.innerHTML = '<i class="fas fa-cog"></i> 고급 설정 보기';
    }
}

/**
 * 슬라이더 초기화 및 이벤트 리스너 설정
 */
function initSliders() {
    // 각 슬라이더에 대한 값 표시 업데이트 설정
    const sliders = [
        { id: 'temperature', defaultValue: 0.2 },
        { id: 'max-tokens', defaultValue: 800 },
        { id: 'top-p', defaultValue: 0.8 },
        { id: 'top-k', defaultValue: 16 }
    ];
    
    sliders.forEach(slider => {
        const sliderElement = document.getElementById(slider.id);
        const valueElement = document.getElementById(`${slider.id}-value`);
        
        if (sliderElement && valueElement) {
            // 값 변경 이벤트 설정
            sliderElement.addEventListener('input', function() {
                valueElement.textContent = this.value;
            });
        }
    });
}

/**
 * 모델 매개변수를 기본값으로 재설정
 */
function resetParameters() {
    document.getElementById('temperature').value = 0.2;
    document.getElementById('temperature-value').textContent = 0.2;
    
    document.getElementById('max-tokens').value = 800;
    document.getElementById('max-tokens-value').textContent = 800;
    
    document.getElementById('top-p').value = 0.8;
    document.getElementById('top-p-value').textContent = 0.8;
    
    document.getElementById('top-k').value = 16;
    document.getElementById('top-k-value').textContent = 16;
}
