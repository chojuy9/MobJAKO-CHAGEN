/**
 * API 상태 관리 스크립트
 * Gemini API의 로드 상태를 확인하고 표시합니다
 */

// 페이지 로드 완료 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // API 상태 표시 요소
    const apiStatus = document.getElementById('api-status');
    if (!apiStatus) return;
    
    // Gemini API 로드 확인
    if (typeof window.GoogleGenerativeAI !== 'undefined') {
        // 이미 로드된 경우
        updateApiStatus('ready', 'Gemini API 준비 완료');
    } else {
        // API 로드 이벤트 리스너
        window.addEventListener('geminiApiLoaded', function() {
            updateApiStatus('ready', 'Gemini API 준비 완료');
        });
        
        // 5초 후에도 로드되지 않으면 오류 표시
        setTimeout(function() {
            if (typeof window.GoogleGenerativeAI === 'undefined') {
                updateApiStatus('error', 'Gemini API 로드 실패');
            }
        }, 5000);
    }
});

/**
 * API 상태 표시 업데이트 함수
 * @param {string} status - 상태 (loading, ready, error)
 * @param {string} message - 표시할 메시지
 */
function updateApiStatus(status, message) {
    const statusElement = document.getElementById('api-status');
    if (!statusElement) return;
    
    statusElement.innerHTML = `
        <div class="status-indicator ${status}">
            <div class="status-dot"></div>
            <span>${message}</span>
        </div>
    `;
}
