/**
 * 푸터를 로드하는 함수
 * 이 스크립트는 모든 페이지에서 공통 푸터를 로드하기 위해 사용됩니다.
 */
document.addEventListener('DOMContentLoaded', function() {
    // 푸터를 삽입할 위치를 찾습니다.
    const footerPlaceholder = document.getElementById('footer-placeholder');
    
    // 푸터를 서버에서 가져옵니다.
    fetch('/${basePath}assets/includes/footer.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('푸터를 로드하는데 실패했습니다.');
            }
            return response.text();
        })
        .then(html => {
            if (footerPlaceholder) {
                // placeholder가 있으면 그 안에 삽입
                footerPlaceholder.innerHTML = html;
            } else {
                console.warn('푸터를 위한 placeholder를 찾을 수 없습니다.');
            }
        })
        .catch(error => {
            console.error('푸터 로드 오류:', error);
        });
});
