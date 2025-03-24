// 전역 변수 선언
let characterDB = {
    // 기본 데이터 (로드 실패 시 사용)
    koreanMaleNames: ["김민수", "이준호", "박지훈", "정우진", "최현우"],
    koreanFemaleNames: ["김지은", "이서연", "박소영", "정다혜", "최예은"],
    englishMaleNames: ["John", "Michael", "David", "James", "Robert"],
    englishFemaleNames: ["Emma", "Olivia", "Sophia", "Ava", "Isabella"],
    ages: ["19", "22", "24", "27", "31", "35"],
    personalities: [
        "내성적이고 조용한 성격, 책읽기를 좋아함",
        "활발하고 사교적인 성격, 파티를 좋아함",
        "진지하고 열정적인 성격, 목표 지향적"
    ],
    traits: [
        "항상 특이한 모자를 쓰고 다님",
        "외국어를 5개 이상 구사할 수 있음",
        "길고양이들에게 먹이를 주는 습관이 있음"
    ],
    appearance: {
        height: [
            {"value": "매우 작은 키", "tags": ["male", "female"]},
            {"value": "작은 키", "tags": ["male", "female"]},
            {"value": "평균 키", "tags": ["male", "female"]},
            {"value": "큰 키", "tags": ["male", "female"]},
            {"value": "매우 큰 키", "tags": ["male", "female"]}
        ],
        hairLength: [
            {"value": "삭발", "tags": ["male"]},
            {"value": "짧은", "tags": ["male", "female"]},
            {"value": "단발", "tags": ["female", "male_rare"]},
            {"value": "어깨 길이", "tags": ["female", "male_rare"]},
            {"value": "긴", "tags": ["female"]},
            {"value": "매우 긴", "tags": ["female"]}
        ],
        hairColor: [
            {"value": "검은색", "tags": ["male", "female"]},
            {"value": "갈색", "tags": ["male", "female"]},
            {"value": "금발", "tags": ["male", "female"]},
            {"value": "빨간색", "tags": ["male", "female"]},
            {"value": "은색", "tags": ["male", "female"]}
        ],
        hairStyle: [
            {"value": "스트레이트", "tags": ["male", "female"]},
            {"value": "웨이브", "tags": ["male", "female"]},
            {"value": "곱슬", "tags": ["male", "female"]},
            {"value": "단정한", "tags": ["male", "female"]},
            {"value": "헝클어진", "tags": ["male", "female"]}
        ],
        eyeColor: [
            {"value": "검은색", "tags": ["male", "female"]},
            {"value": "갈색", "tags": ["male", "female"]},
            {"value": "파란색", "tags": ["male", "female"]},
            {"value": "녹색", "tags": ["male", "female"]},
            {"value": "회색", "tags": ["male", "female"]}
        ],
        chestSize: [
            {"value": "평평한", "tags": ["male"]},
            {"value": "작은", "tags": ["female"]},
            {"value": "보통", "tags": ["female"]},
            {"value": "큰", "tags": ["female"]}
        ],
        build: [
            {"value": "매우 허약한", "tags": ["male", "female"]},
            {"value": "허약한", "tags": ["male", "female"]},
            {"value": "보통", "tags": ["male", "female"]},
            {"value": "튼튼한", "tags": ["male", "female"]},
            {"value": "매우 튼튼한", "tags": ["male", "female"]},
            {"value": "근육질의", "tags": ["male", "female"]}
        ]
    }
};

// 현재 캐릭터 데이터
let currentCharacter = null;

// DOM이 완전히 로드된 후 실행
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM 로드 완료, 데이터 로드 및 초기화 시작");
    
    // 앱 초기화 시작
    initializeApp();
});

// 앱 초기화 함수
async function initializeApp() {
    try {
        console.log("앱 초기화 시작");
        showLoading(true);
        
        // 데이터 로드 시도
        const loadSuccess = await tryLoadData();
        
        // UI 초기화
        initializeUI();
        
        // 로딩 화면 숨기기
        showLoading(false);
        
        if (!loadSuccess) {
            console.warn('외부 데이터 로드에 실패했습니다. 기본 데이터를 사용합니다.');
            
            // 오류 메시지 추가
            const errorContainer = document.getElementById('error-container');
            if (errorContainer) {
                errorContainer.innerHTML = `
                    <div class="error-message">
                        외부 데이터 파일을 로드할 수 없습니다. 기본 데이터로 실행됩니다.
                    </div>
                `;
            }
        }
        
        console.log("앱 초기화 완료");
    } catch (error) {
        console.error("앱 초기화 중 오류 발생:", error);
        showError(error.message);
    }
}

// 로딩 표시 함수
function showLoading(show) {
    const container = document.getElementById('app-container');
    
    if (show) {
        container.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                데이터를 불러오는 중입니다...
            </div>
        `;
    }
}

// 오류 표시 함수
function showError(errorMessage) {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
        errorContainer.innerHTML = `
            <div class="error-message">
                ${errorMessage}
            </div>
        `;
    }
}

// 데이터 로드 시도 함수
async function tryLoadData() {
    try {
        const basePath = getBasePath();
        console.log('경로:', basePath);
        
        // 연결 테스트
        const testResponse = await fetch(`${basePath}data/names/korean_male_names.json`);
        if (!testResponse.ok) {
            throw new Error(`데이터 로드 테스트 실패: ${testResponse.status}`);
        }
        
        // 실제 데이터 로드
        // 이름 데이터 로드
        const koreanMaleResponse = await fetch(`${basePath}data/names/korean_male_names.json`);
        const koreanFemaleResponse = await fetch(`${basePath}data/names/korean_female_names.json`);
        const englishMaleResponse = await fetch(`${basePath}data/names/english_male_names.json`);
        const englishFemaleResponse = await fetch(`${basePath}data/names/english_female_names.json`);
        
        // 기본 속성 데이터 로드
        const agesResponse = await fetch(`${basePath}data/ages.json`);
        const personalitiesResponse = await fetch(`${basePath}data/personalities.json`);
        const traitsResponse = await fetch(`${basePath}data/traits.json`);
        
        // 외모 속성 데이터 로드
        const heightResponse = await fetch(`${basePath}data/appearances/height.json`);
        const hairLengthResponse = await fetch(`${basePath}data/appearances/hair_length.json`);
        const hairColorResponse = await fetch(`${basePath}data/appearances/hair_color.json`);
        const hairStyleResponse = await fetch(`${basePath}data/appearances/hair_style.json`);
        const eyeColorResponse = await fetch(`${basePath}data/appearances/eye_color.json`);
        const chestSizeResponse = await fetch(`${basePath}data/appearances/chest_size.json`);
        const buildResponse = await fetch(`${basePath}data/appearances/build.json`);
        
        // 응답을 JSON으로 변환
        const koreanMaleData = await koreanMaleResponse.json();
        const koreanFemaleData = await koreanFemaleResponse.json();
        const englishMaleData = await englishMaleResponse.json();
        const englishFemaleData = await englishFemaleResponse.json();
        
        const agesData = await agesResponse.json();
        const personalitiesData = await personalitiesResponse.json();
        const traitsData = await traitsResponse.json();
        
        const heightData = await heightResponse.json();
        const hairLengthData = await hairLengthResponse.json();
        const hairColorData = await hairColorResponse.json();
        const hairStyleData = await hairStyleResponse.json();
        const eyeColorData = await eyeColorResponse.json();
        const chestSizeData = await chestSizeResponse.json();
        const buildData = await buildResponse.json();
        
        // 데이터 저장
        characterDB.koreanMaleNames = koreanMaleData.names;
        characterDB.koreanFemaleNames = koreanFemaleData.names;
        characterDB.englishMaleNames = englishMaleData.names;
        characterDB.englishFemaleNames = englishFemaleData.names;
        
        characterDB.ages = agesData.ages;
        characterDB.personalities = personalitiesData.personalities;
        characterDB.traits = traitsData.traits;
        
        characterDB.appearance.height = heightData.height;
        characterDB.appearance.hairLength = hairLengthData.hair_length;
        characterDB.appearance.hairColor = hairColorData.hair_color;
        characterDB.appearance.hairStyle = hairStyleData.hair_style;
        characterDB.appearance.eyeColor = eyeColorData.eye_color;
        characterDB.appearance.chestSize = chestSizeData.chest_size;
        characterDB.appearance.build = buildData.build;
        
        console.log('모든 데이터 로드 완료!');
        return true;
    } catch (error) {
        console.error('데이터 로드 실패:', error);
        return false;
    }
}

// UI 초기화 함수
function initializeUI() {
    const container = document.getElementById('app-container');
    
    // UI HTML 생성
    container.innerHTML = `
        <h1>모브 캐릭터 생성기</h1>
        
        <div id="error-container"></div>
        
        <div class="filter-section">
            <div class="filter-title">캐릭터 필터 설정</div>
            <div class="filter-options">
                <div class="filter-group">
                    <label>성별:</label>
                    <div class="radio-group">
                        <label class="radio-label">
                            <input type="radio" name="gender" value="random" checked> 랜덤
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="gender" value="male"> 남성
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="gender" value="female"> 여성
                        </label>
                    </div>
                </div>
                
                <div class="filter-group">
                    <label>이름 언어:</label>
                    <div class="radio-group">
                        <label class="radio-label">
                            <input type="radio" name="name-language" value="random" checked> 랜덤
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="name-language" value="korean"> 한국어
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="name-language" value="english"> 영어
                        </label>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="character-attributes">
            <div class="attribute">
                <div class="attribute-label">이름:</div>
                <div class="attribute-value" id="name-value">-</div>
            </div>
            
            <div class="attribute">
                <div class="attribute-label">나이:</div>
                <div class="attribute-value" id="age-value">-</div>
            </div>
            
            <div class="attribute">
                <div class="attribute-label">성별:</div>
                <div class="attribute-value" id="gender-value">-</div>
            </div>
            
            <div class="attribute">
                <div class="attribute-label">외모:</div>
                <div class="attribute-value" id="appearance-value">-</div>
            </div>
            
            <div class="attribute">
                <div class="attribute-label">성격:</div>
                <div class="attribute-value" id="personality-value">-</div>
            </div>
            
            <div class="attribute">
                <div class="attribute-label">특징:</div>
                <div class="attribute-value" id="trait-value">-</div>
            </div>
        </div>
        
        <button id="generate-btn">✨ 캐릭터 생성하기 ✨</button>
        
        <div class="markdown-result" id="markdown-result" style="display: none;">
            <h3>마크다운 결과</h3>
            <pre id="markdown-content"></pre>
            <button id="copy-btn">복사</button>
        </div>
        
        <div id="saved-characters"></div>
    `;
    
    // 이벤트 리스너 추가
    document.getElementById('generate-btn').addEventListener('click', generateCharacter);
    
    // 복사 버튼 이벤트 리스너
    document.getElementById('copy-btn').addEventListener('click', copyMarkdown);
    
    // 첫 캐릭터 생성
    generateCharacter();
}

// 이름 선택 함수
function getFilteredName(gender, nameLanguage) {
    // 성별과 언어에 따라 적절한 이름 배열 선택
    let nameArray;
    
    if (nameLanguage === 'korean') {
        nameArray = (gender === 'male') ? characterDB.koreanMaleNames : characterDB.koreanFemaleNames;
    } else {
        nameArray = (gender === 'male') ? characterDB.englishMaleNames : characterDB.englishFemaleNames;
    }
    
    // 랜덤 이름 선택
    return getRandomItem(nameArray);
}

// 외모 속성 필터링 함수
function getFilteredAppearanceItem(items, gender) {
    // 성별에 맞는 항목만 필터링
    let filteredItems = items.filter(item => 
        item.tags.includes(gender) || 
        (gender === 'male' && item.tags.includes('male_rare'))
    );
    
    // 필터링된 항목이 없으면 모든 항목에서 선택
    if (filteredItems.length === 0) {
        filteredItems = items;
    }
    
    // 랜덤 선택
    return filteredItems[Math.floor(Math.random() * filteredItems.length)].value;
}

// 캐릭터 생성 함수
function generateCharacter() {
    try {
        // 선택된 성별 가져오기
        const selectedGender = document.querySelector('input[name="gender"]:checked').value;
        
        // 선택된 이름 언어 가져오기
        const selectedNameLang = document.querySelector('input[name="name-language"]:checked').value;
        
        // 성별 결정 (랜덤 옵션 처리)
        const gender = (selectedGender === 'random') ? 
            (Math.random() < 0.5 ? 'male' : 'female') : selectedGender;
        
        // 이름 언어 결정 (랜덤 옵션 처리)
        const nameLanguage = (selectedNameLang === 'random') ?
            (Math.random() < 0.5 ? 'korean' : 'english') : selectedNameLang;
        
        // 이름 선택
        const name = getFilteredName(gender, nameLanguage);
        
        // 나머지 속성 생성
        const age = getRandomItem(characterDB.ages);
        const personality = getRandomItem(characterDB.personalities);
        const trait = getRandomItem(characterDB.traits);
        
        // 외모 속성 생성
        const height = getFilteredAppearanceItem(characterDB.appearance.height, gender);
        const hairColor = getFilteredAppearanceItem(characterDB.appearance.hairColor, gender);
        const hairLength = getFilteredAppearanceItem(characterDB.appearance.hairLength, gender);
        const hairStyle = getFilteredAppearanceItem(characterDB.appearance.hairStyle, gender);
        const eyeColor = getFilteredAppearanceItem(characterDB.appearance.eyeColor, gender);
        const build = getFilteredAppearanceItem(characterDB.appearance.build, gender);
        
        // 외모 설명 조합 (성별에 따라 다르게)
        let appearance;
        if (gender === 'male') {
            appearance = `${height}에 ${build} 체형, ${hairLength} ${hairColor} ${hairStyle} 머리, ${eyeColor} 눈동자`;
        } else {
            const chestSize = getFilteredAppearanceItem(characterDB.appearance.chestSize, gender);
            appearance = `${height}에 ${build} 체형, ${hairLength} ${hairColor} ${hairStyle} 머리, ${eyeColor} 눈동자, ${chestSize} 가슴`;
        }
        
        // 현재 캐릭터 데이터 저장
        currentCharacter = {
            name: name,
            age: age,
            gender: gender === 'male' ? '남성' : '여성',
            nameLanguage: nameLanguage,
            appearance: appearance,
            personality: personality,
            trait: trait
        };
        
        // UI 업데이트
        updateCharacterDisplay();
    } catch (error) {
        console.error('캐릭터 생성 중 오류:', error);
        
        // 오류 메시지 표시
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="error-message">
                    캐릭터 생성 중 오류가 발생했습니다: ${error.message}
                </div>
            `;
        }
    }
}

// 캐릭터 표시 업데이트
function updateCharacterDisplay() {
    if (!currentCharacter) return;
    
    // 애니메이션 효과를 위해 모든 애니메이션 초기화
    const attributes = document.querySelectorAll('.attribute');
    attributes.forEach(attr => {
        attr.style.opacity = '0';
        void attr.offsetWidth; // 리플로우 강제로 트리거
        attr.style.opacity = ''; // 스타일 제거하여 CSS에서 정의한 애니메이션 적용
    });
    
    document.getElementById('name-value').textContent = currentCharacter.name;
    document.getElementById('age-value').textContent = currentCharacter.age;
    document.getElementById('gender-value').textContent = currentCharacter.gender;
    document.getElementById('appearance-value').textContent = currentCharacter.appearance;
    document.getElementById('personality-value').textContent = currentCharacter.personality;
    document.getElementById('trait-value').textContent = currentCharacter.trait;
    
    // 마크다운 결과 표시
    const markdownResult = document.getElementById('markdown-result');
    const markdownContent = document.getElementById('markdown-content');
    
    markdownResult.style.display = 'block';
    markdownContent.textContent = generateMarkdown(currentCharacter);
}

// 마크다운 형식으로 변환
function generateMarkdown(character) {
    if (!character) return '';
    
    return `## ${character.name}
* **나이:** ${character.age}
* **성별:** ${character.gender}
* **외모:** ${character.appearance}
* **성격:** ${character.personality}
* **특징:** ${character.trait}`;
}

// 마크다운 복사 함수
function copyMarkdown() {
    const markdownContent = document.getElementById('markdown-content');
    
    // 텍스트를 선택하는 방법 사용
    const range = document.createRange();
    range.selectNodeContents(markdownContent);
    
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    try {
        // 복사 명령 시도
        const successful = document.execCommand('copy');
        
        if (successful) {
            // 복사 성공
            const copyBtn = document.getElementById('copy-btn');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '복사 완료! ✨';
            copyBtn.style.backgroundColor = '#4CAF50';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.backgroundColor = '';
            }, 2000);
        } else {
            // 복사 실패
            alert('복사에 실패했습니다. 직접 선택하여 복사해주세요.');
        }
    } catch (err) {
        console.error('복사 실패:', err);
        alert('복사에 실패했습니다. 직접 선택하여 복사해주세요.');
    }
    
    // 선택 해제
    selection.removeAllRanges();
}

// 랜덤 항목 선택 함수
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}
