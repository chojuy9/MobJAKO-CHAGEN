/**
 * advanced-params.js - Gemini 모델 매개변수 관리 스크립트
 * 사용자가 설정한 매개변수 값을 관리하고 툴팁을 제공합니다.
 */

document.addEventListener('DOMContentLoaded', function() {
    // 매개변수 설명 툴팁 초기화
    initParameterTooltips();
    
    // 로컬 스토리지에서 저장된 매개변수 불러오기
    loadSavedParameters();
    
    // 매개변수 변경 이벤트 리스너 설정
    setupParameterChangeListeners();
    
    // 토글 버튼은 인라인 스크립트에서 처리하므로 여기서는 제거
});

/**
 * 매개변수 설명 툴팁 초기화
 */
function initParameterTooltips() {
    const parameterDescriptions = {
        'temperature': '높을수록 더 창의적이고 다양한 번역을 생성합니다. 낮을수록 일관되고 예측 가능한 번역을 생성합니다.',
        'max-tokens': '번역 결과의 최대 길이를 설정합니다. 긴 텍스트를 번역할 때는 이 값을 높게 설정하세요.',
        'top-p': '모델이 선택할 수 있는 단어의 다양성을 제어합니다. 낮은 값은 더 결정적인 번역을 생성합니다.',
        'top-k': '모델이 각 단계에서 고려하는 다음 단어 후보의 수를 제한합니다. 낮은 값은 더 집중적인 번역을 생성합니다.'
    };
    
    for (const [id, description] of Object.entries(parameterDescriptions)) {
        const paramElement = document.getElementById(id);
        if (paramElement) {
            const descElement = paramElement.closest('.form-group').querySelector('.parameter-description');
            if (descElement) {
                descElement.setAttribute('title', description);
            }
        }
    }
}

/**
 * 매개변수 변경 이벤트 리스너 설정
 */
function setupParameterChangeListeners() {
    const parameterIds = ['temperature', 'max-tokens', 'top-p', 'top-k'];
    
    parameterIds.forEach(id => {
        const slider = document.getElementById(id);
        if (slider) {
            slider.addEventListener('input', function() {
                // 슬라이더 값이 변경될 때 표시 업데이트
                const valueDisplay = document.getElementById(`${id}-value`);
                if (valueDisplay) {
                    valueDisplay.textContent = this.value;
                }
            });
            
            slider.addEventListener('change', function() {
                // 값이 변경될 때 로컬 스토리지에 저장
                saveParameterValue(id, this.value);
            });
        }
    });
    
    // 재설정 버튼 이벤트
    const resetButton = document.getElementById('reset-parameters');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            // 모든 매개변수를 기본값으로 재설정하고 저장
            resetAndSaveParameters();
        });
    }
}

/**
 * 매개변수 값을 로컬 스토리지에 저장
 * @param {string} id - 매개변수 ID
 * @param {string} value - 매개변수 값
 */
function saveParameterValue(id, value) {
    localStorage.setItem(`gemini_param_${id}`, value);
}

/**
 * 로컬 스토리지에서 저장된 매개변수 불러오기
 */
function loadSavedParameters() {
    const parameterIds = ['temperature', 'max-tokens', 'top-p', 'top-k'];
    
    parameterIds.forEach(id => {
        const savedValue = localStorage.getItem(`gemini_param_${id}`);
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(`${id}-value`);
        
        if (savedValue && slider && valueDisplay) {
            slider.value = savedValue;
            valueDisplay.textContent = savedValue;
        }
    });
}

/**
 * 모든 매개변수를 기본값으로 재설정하고 저장
 */
function resetAndSaveParameters() {
    const defaultValues = {
        'temperature': 0.2,
        'max-tokens': 800,
        'top-p': 0.8,
        'top-k': 16
    };
    
    for (const [id, value] of Object.entries(defaultValues)) {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(`${id}-value`);
        
        if (slider && valueDisplay) {
            slider.value = value;
            valueDisplay.textContent = value;
            saveParameterValue(id, value);
        }
    }
}
