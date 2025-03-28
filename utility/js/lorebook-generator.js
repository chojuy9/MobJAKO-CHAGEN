/**
 * lorebook-generator.js - 로어북 생성기 전용 스크립트
 * 로어북 생성 및 관련 UI 기능을 처리합니다
 */

document.addEventListener('DOMContentLoaded', function() {
    // 템플릿 카드 선택 기능 초기화
    initializeTemplateSelection();
    
    // 로어북 생성 폼 제출 이벤트
    initializeLorebookForm();
});

/**
 * 템플릿 카드 선택 기능 초기화
 */
function initializeTemplateSelection() {
    const templateCards = document.querySelectorAll('.template-card');
    if (templateCards.length > 0) {
        templateCards.forEach(card => {
            card.addEventListener('click', function() {
                templateCards.forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                
                // 선택된 템플릿에 따라 설명 텍스트나 예시 변경 가능
                updatePlaceholders(this.dataset.template);
            });
        });
    }
}

/**
 * 선택된 템플릿에 따라 입력 필드의 플레이스홀더 변경
 * @param {string} templateType - 선택된 템플릿 타입
 */
function updatePlaceholders(templateType) {
    const worldNameInput = document.getElementById('world-name');
    const worldConceptInput = document.getElementById('world-concept');
    
    if (worldNameInput && worldConceptInput) {
        // 템플릿별 적절한 예시 제공
        switch(templateType) {
            case 'fantasy':
                worldNameInput.placeholder = '예: 아르카디아, 미스트헤븐...';
                worldConceptInput.placeholder = '예: 마법이 일상인 중세 세계, 신들이 직접 개입하는 세계...';
                break;
            case 'scifi':
                worldNameInput.placeholder = '예: 네오테라, 스텔라리스...';
                worldConceptInput.placeholder = '예: 인공지능이 진화한 미래, 행성 간 갈등이 있는 우주 시대...';
                break;
            case 'urban':
                worldNameInput.placeholder = '예: 섀도우시티, 미스틱 서울...';
                worldConceptInput.placeholder = '예: 현대 도시에 숨겨진 마법 사회, 초자연 생물과 인간의 공존...';
                break;
            case 'post-apocalyptic':
                worldNameInput.placeholder = '예: 애쉬랜드, 뉴에덴...';
                worldConceptInput.placeholder = '예: 핵전쟁 후 100년, 기후 재앙으로 변화한 지구...';
                break;
        }
    }
}

/**
 * 로어북 생성 폼 초기화 및 이벤트 처리
 */
function initializeLorebookForm() {
    const lorebookForm = document.getElementById('lorebook-form');
    if (lorebookForm) {
        lorebookForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const worldName = document.getElementById('world-name').value.trim();
            const worldConcept = document.getElementById('world-concept').value.trim();
            
            if (!worldName || !worldConcept) {
                alert('세계 이름과 컨셉을 모두 입력해주세요.');
                return;
            }
            
            // 선택된 템플릿 확인
            const selectedTemplate = document.querySelector('.template-card.selected').dataset.template;
            
            // 로딩 표시
            document.getElementById('lorebook-loading').classList.add('active');
            document.getElementById('lorebook-result').style.display = 'none';
            
            // API 호출 (현재는 시뮬레이션)
            setTimeout(() => {
                generateLorebook(worldName, worldConcept, selectedTemplate);
            }, 2000);
        });
    }
}

/**
 * 로어북 생성 함수
 * @param {string} worldName - 세계 이름
 * @param {string} worldConcept - 세계관 컨셉
 * @param {string} template - 선택된 템플릿
 */
function generateLorebook(worldName, worldConcept, template) {
    // 실제 구현에서는 API 호출로 대체
    // 현재는 템플릿별 샘플 응답 제공
    
    let result = `# ${worldName} 로어북\n\n`;
    
    // 템플릿별 내용 생성
    if (template === 'fantasy') {
        result += getFantasyLorebook(worldName, worldConcept);
    } else if (template === 'scifi') {
        result += getScifiLorebook(worldName, worldConcept);
    } else if (template === 'urban') {
        result += getUrbanFantasyLorebook(worldName, worldConcept);
    } else {
        result += getPostApocalypticLorebook(worldName, worldConcept);
    }
    
    // 공통 섹션 추가
    result += getCommonSections(worldName);
    
    // 결과 표시
    document.getElementById('lorebook-loading').classList.remove('active');
    const resultElement = document.getElementById('lorebook-result');
    resultElement.textContent = result;
    resultElement.style.display = 'block';
    
    // 분석 및 로깅 (실제 구현 시)
    logGenerationEvent(template, result.length);
}

/**
 * 판타지 로어북 템플릿 내용 생성
 */
function getFantasyLorebook(worldName, worldConcept) {
    let content = `## 세계관 개요\n${worldName}은(는) ${worldConcept}인 판타지 세계입니다. 마법이 일상에 깊이 뿌리내린 이 세계에서는 다양한 종족들이 공존하며 각자의 문명을 발전시켜 왔습니다.\n\n`;
    content += `## 주요 종족\n- 인간: 적응력과 창의성이 뛰어나 다양한 왕국을 건설했습니다.\n- 엘프: 자연과 조화를 이루며 살아가는 장수 종족입니다.\n- 드워프: 뛰어난 대장장이이자 광부로, 산맥 아래 웅장한 도시를 건설했습니다.\n\n`;
    content += `## 마법 체계\n${worldName}의 마법은 원소의 힘을 다루는 방식으로 발전했습니다. 불, 물, 흙, 공기의 네 가지 기본 원소를 조합하여 다양한 주문을 만들어낼 수 있습니다.\n\n`;
    return content;
}

/**
 * SF 로어북 템플릿 내용 생성
 */
function getScifiLorebook(worldName, worldConcept) {
    let content = `## 세계관 개요\n${worldName}은(는) ${worldConcept}인 미래 세계입니다. 인류는 은하계 전역에 퍼져나갔으며, 다양한 외계 종족들과 접촉하고 있습니다.\n\n`;
    content += `## 주요 문명\n- 지구 연합: 인류의 본거지이자 정치적 중심지입니다.\n- 알파 공동체: 인공지능이 통치하는 고도로 발전된 행성계입니다.\n- 오메가 무역 연맹: 다양한 종족들이 모여 상업 활동을 하는 중립 지대입니다.\n\n`;
    content += `## 기술 수준\n초광속 우주 여행이 일반화되었으며, 테라포밍, 나노기술, 의식 업로드 등의 기술이 발전했습니다. 인공지능은 사회의 모든 영역에 통합되어 있습니다.\n\n`;
    return content;
}

/**
 * 어반 판타지 로어북 템플릿 내용 생성
 */
function getUrbanFantasyLorebook(worldName, worldConcept) {
    let content = `## 세계관 개요\n${worldName}은(는) ${worldConcept}인 현대 세계입니다. 일반 대중은 모르지만, 그림자 속에서 마법사, 흡혈귀, 늑대인간 등 초자연적 존재들이 활동하고 있습니다.\n\n`;
    content += `## 은밀한 사회\n- 마법사 길드: 도시 곳곳에 숨겨진 마법 학교와 연구소를 운영합니다.\n- 야행 클럽: 흡혈귀들의 사교 모임으로, 고급 나이트클럽을 소유하고 있습니다.\n- 수호자 협회: 초자연적 범죄와 싸우는 비밀 조직입니다.\n\n`;
    content += `## 마법의 현대적 응용\n현대 기술과 마법의 융합으로 새로운 형태의 마법 기기들이 등장했습니다. 마법 인터넷, 주문이 걸린 스마트폰, 영혼을 담는 배터리 등이 비밀리에 사용되고 있습니다.\n\n`;
    return content;
}

/**
 * 포스트 아포칼립스 로어북 템플릿 내용 생성
 */
function getPostApocalypticLorebook(worldName, worldConcept) {
    let content = `## 세계관 개요\n${worldName}은(는) ${worldConcept}인 황폐화된 세계입니다. 대재앙 이후 인류 문명은 붕괴되었고, 살아남은 이들은 자원을 두고 끊임없이 갈등하고 있습니다.\n\n`;
    content += `## 주요 파벌\n- 새 질서: 강력한 지도자 아래 군사적 규율을 중시하는 집단입니다.\n- 자유인: 독립적인 부족 형태로 살아가며 자유를 중시합니다.\n- 기계 숭배자: 고대 기술을 신성시하고 복원하려는 집단입니다.\n\n`;
    content += `## 생존 환경\n오염된 대기와 변형된 생태계로 인해 보호 장비 없이는 외부 활동이 어렵습니다. 깨끗한 물과 식량, 의약품은 가장 귀중한 자원이 되었습니다.\n\n`;
    return content;
}

/**
 * 모든 로어북에 공통으로 들어갈 섹션 생성
 */
function getCommonSections(worldName) {
    let content = `## 주요 지리\n${worldName}의 주요 지역들은 각기 독특한 특성과 문화를 가지고 있습니다. 고대 유적, 신비한 숲, 위험한 황무지 등 다양한 환경이 탐험가들을 기다립니다.\n\n`;
    content += `## 역사\n수천 년에 걸친 ${worldName}의 역사는 위대한 영웅들과 끔찍한 악당들의 이야기로 가득합니다. 고대 문명의 흥망성쇠, 전설적인 전쟁, 신화적 사건들이 세계의 현재를 형성했습니다.\n\n`;
    return content;
}

/**
 * 로어북 생성 이벤트 로깅 함수 (분석 목적)
 * @param {string} templateType - 선택된 템플릿 유형
 * @param {number} contentLength - 생성된 내용의 길이
 */
function logGenerationEvent(templateType, contentLength) {
    // 분석 목적으로 생성 이벤트 로깅 (실제 구현 시)
    console.log(`로어북 생성 이벤트: ${templateType}, 글자 수: ${contentLength}`);
    
    // 실제 구현에서는 서버로 분석 데이터 전송
    // 사용자 개인정보는 수집하지 않음
}

/**
 * 로어북 내용을 클립보드에 복사하는 함수
 * 복사 버튼이 추가될 경우 사용
 */
function copyLorebookContent() {
    const resultElement = document.getElementById('lorebook-result');
    
    if (resultElement) {
        const textToCopy = resultElement.textContent;
        
        // 클립보드 복사 구현
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                alert('로어북 내용이 클립보드에 복사되었습니다.');
            })
            .catch(err => {
                console.error('복사 실패:', err);
                alert('복사에 실패했습니다. 직접 선택하여 복사해주세요.');
            });
    }
}

/**
 * 로어북 내용을 텍스트 파일로 저장하는 함수
 * 저장 버튼이 추가될 경우 사용
 */
function saveLorebookAsFile() {
    const resultElement = document.getElementById('lorebook-result');
    const worldName = document.getElementById('world-name').value.trim();
    
    if (resultElement) {
        const content = resultElement.textContent;
        const fileName = `${worldName.replace(/\s+/g, '_')}_lorebook.md`;
        
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        // 정리
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
}
