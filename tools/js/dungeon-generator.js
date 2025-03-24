// 전역 변수 선언
let dungeon = {
    floors: [],
    structures: [],
    atmospheres: []
};

let monsters = {
    fire: [],
    water: [],
    earth: [],
    air: [],
    ice: [],
    nature: [],
    undead: [],
    magic: []
};

// 구조에 따른 몬스터 타입 호환성 (기존 코드에서 유지)
const structureCompatibility = {
    cave: ["슬라임", "야수", "벌레", "거인", "드래곤"],
    castle: ["인간형", "언데드", "구현체", "정령"],
    temple: ["인간형", "언데드", "구현체", "정령", "드래곤"],
    mine: ["슬라임", "벌레", "거인", "드래곤", "구현체"],
    crypt: ["언데드", "인간형", "슬라임", "구현체"],
    forest: ["인간형", "야수", "벌레", "식물", "드래곤", "정령"],
    volcano: ["슬라임", "야수", "거인", "드래곤", "정령"]
};

// 선택된 몬스터 배열
let selectedMonsters = [];

// 몬스터 HP 계산 함수 (희귀도에 따라 다른 값 반환)
function getMonsterHP(monster) {
    switch(monster.rarity) {
        case "일반": return Math.floor(Math.random() * 20) + 30;
        case "희귀": return Math.floor(Math.random() * 30) + 50;
        case "매우 희귀": return Math.floor(Math.random() * 40) + 80;
        case "전설": return Math.floor(Math.random() * 50) + 120;
        default: return 50;
    }
}

// 몬스터 공격력 계산 함수
function getMonsterATK(monster) {
    switch(monster.rarity) {
        case "일반": return Math.floor(Math.random() * 5) + 5;
        case "희귀": return Math.floor(Math.random() * 8) + 8;
        case "매우 희귀": return Math.floor(Math.random() * 10) + 15;
        case "전설": return Math.floor(Math.random() * 15) + 25;
        default: return 10;
    }
}

// DOM이 완전히 로드된 후 실행
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM 로드 완료, 데이터 로드 및 이벤트 리스너 등록 시작");
    
    // 데이터 로드 시작
    initializeApp();
    
    // 모바일 메뉴 토글은 common.js에서 처리됨
    
    // 던전 생성 폼 제출 처리
    document.getElementById('dungeon-form').addEventListener('submit', function(e) {
        e.preventDefault();
        console.log("폼 제출 이벤트 발생");
        generateDungeon();
    });
    
    // 생성 버튼에 직접 클릭 이벤트 추가
    document.getElementById('generate-btn').addEventListener('click', function(e) {
        e.preventDefault();
        console.log("생성 버튼 클릭됨");
        generateDungeon();
    });
    
    // 결과 생성 버튼 이벤트 리스너
    const createResultBtn = document.getElementById('create-result-btn');
    if (createResultBtn) {
        createResultBtn.addEventListener('click', function() {
            console.log("결과 생성 버튼 클릭됨");
            createResultOutput();
        });
    }
});

// 앱 초기화 함수
async function initializeApp() {
    try {
        console.log("앱 초기화 시작");
        showLoading(true);
        
        const basePath = getBasePath();
        console.log("기본 경로:", basePath);
        console.log("예상 데이터 경로:", basePath + "data/dungeon/floors.json");
        
        // 데이터를 3번까지 시도
        let attemptsLeft = 3;
        let success = false;
        
        while (attemptsLeft > 0 && !success) {
            try {
                console.log(`데이터 로드 시도 (남은 시도: ${attemptsLeft})`);
                // 기본 던전 데이터 로드
                await loadDungeonData();
                success = true;
            } catch (error) {
                attemptsLeft--;
                console.error(`데이터 로드 실패 (남은 시도: ${attemptsLeft})`, error);
                
                if (attemptsLeft > 0) {
                    // 1초 대기 후 재시도
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }
        
        if (!success) {
            throw new Error("최대 시도 횟수 초과: 데이터를 로드할 수 없습니다.");
        }
        
        // 폼 초기화
        initializeForm();
        
        // 로딩 화면 숨기기 및 폼 표시
        showLoading(false);
        document.getElementById('dungeon-form').style.display = 'block';
        
        console.log("앱 초기화 완료");
    } catch (error) {
        console.error("앱 초기화 중 오류 발생:", error);
        const errorDetails = `
            ${error.message}<br>
            현재 경로: ${getBasePath()}<br>
            호스트: ${window.location.hostname}<br>
            <br>
            디버깅 정보:<br>
            dungeon.floors 타입: ${typeof dungeon.floors}<br>
            dungeon.floors 배열 여부: ${Array.isArray(dungeon.floors)}<br>
            dungeon 객체: ${JSON.stringify(dungeon).slice(0, 200)}...
        `;
        showError(true, errorDetails);
    }
}

// 로딩 화면 표시/숨김 함수
function showLoading(show) {
    document.getElementById('loading-container').style.display = show ? 'flex' : 'none';
}

// 오류 화면 표시/숨김 함수
function showError(show, errorMessage) {
    const errorContainer = document.getElementById('error-container');
    const dungenForm = document.getElementById('dungeon-form');
    const loadingContainer = document.getElementById('loading-container');
    
    // 에러 컨테이너 내용 업데이트
    if (show && errorMessage) {
        const errorText = document.createElement('div');
        errorText.className = 'error-details';
        errorText.innerHTML = `
            <p><strong>오류 상세:</strong></p>
            <code>${errorMessage}</code>
            <p style="margin-top: 15px;">개발자 도구(F12)를 열어 콘솔 로그를 확인하면 더 자세한 정보를 볼 수 있습니다.</p>
        `;
        
        // 기존 오류 상세 정보가 있으면 제거
        const existingDetails = errorContainer.querySelector('.error-details');
        if (existingDetails) {
            existingDetails.remove();
        }
        
        // 새 오류 정보 추가
        document.querySelector('#error-container h3').after(errorText);
    }
    
    // 컨테이너 표시/숨김 설정
    errorContainer.style.display = show ? 'block' : 'none';
    dungenForm.style.display = show ? 'none' : 'block';
    loadingContainer.style.display = 'none';
    
    // 재시도 버튼 이벤트 리스너 추가
    if (show) {
        document.getElementById('retry-btn').addEventListener('click', function() {
            showError(false);
            initializeApp();
        });
    }
}

// JSON 파일 로드 유틸리티 함수
async function loadJSON(url) {
    try {
        // 기본 경로 가져오기
        const basePath = getBasePath();
        // 전체 URL 생성
        const fullUrl = `${basePath}${url}`;
        console.log(`JSON 파일 로드 중: ${fullUrl}`);
        
        const response = await fetch(fullUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} - ${fullUrl}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`${url} 로드 중 오류 발생:`, error);
        throw error;
    }
}

// 던전 데이터 로드 함수
async function loadDungeonData() {
    try {
        console.log("던전 데이터 로드 시작");
        const basePath = getBasePath();
        
        // 연결 테스트
        console.log("연결 테스트 진행 중...");
        const testResponse = await fetch(`${basePath}data/dungeon/floors.json`);
        if (!testResponse.ok) {
            throw new Error(`데이터 로드 테스트 실패: ${testResponse.status}`);
        }
        console.log("연결 테스트 성공!");
        
        // 기본 던전 데이터 로드
        const floorsResponse = await fetch(`${basePath}data/dungeon/floors.json`);
        const structuresResponse = await fetch(`${basePath}data/dungeon/structures.json`);
        const atmospheresResponse = await fetch(`${basePath}data/dungeon/atmospheres.json`);
        
        // 응답을 JSON으로 변환
        const floorsData = await floorsResponse.json();
        const structuresData = await structuresResponse.json();
        const atmospheresData = await atmospheresResponse.json();
        
        // 로드된 데이터 구조 로깅
        console.log("floors 데이터 구조:", JSON.stringify(floorsData).slice(0, 100) + "...");
        console.log("structures 데이터 구조:", JSON.stringify(structuresData).slice(0, 100) + "...");
        console.log("atmospheres 데이터 구조:", JSON.stringify(atmospheresData).slice(0, 100) + "...");
        
        // 데이터 저장 및 검증 (데이터 구조에 맞게 처리)
        if (floorsData && typeof floorsData === 'object') {
            // 객체인 경우 floors 속성이 있는지 확인
            if (Array.isArray(floorsData.floors)) {
                dungeon.floors = floorsData.floors;
            } else if (Array.isArray(floorsData)) {
                dungeon.floors = floorsData;
            } else {
                dungeon.floors = []; // 비어있는 배열로 기본값 설정
                console.error("유효한 floors 데이터가 없습니다:", floorsData);
            }
        } else {
            dungeon.floors = [];
            console.error("floors 데이터가 유효하지 않습니다:", floorsData);
        }
        
        if (structuresData && typeof structuresData === 'object') {
            if (Array.isArray(structuresData.structures)) {
                dungeon.structures = structuresData.structures;
            } else if (Array.isArray(structuresData)) {
                dungeon.structures = structuresData;
            } else {
                dungeon.structures = [];
                console.error("유효한 structures 데이터가 없습니다:", structuresData);
            }
        } else {
            dungeon.structures = [];
            console.error("structures 데이터가 유효하지 않습니다:", structuresData);
        }
        
        if (atmospheresData && typeof atmospheresData === 'object') {
            if (Array.isArray(atmospheresData.atmospheres)) {
                dungeon.atmospheres = atmospheresData.atmospheres;
            } else if (Array.isArray(atmospheresData)) {
                dungeon.atmospheres = atmospheresData;
            } else {
                dungeon.atmospheres = [];
                console.error("유효한 atmospheres 데이터가 없습니다:", atmospheresData);
            }
        } else {
            dungeon.atmospheres = [];
            console.error("atmospheres 데이터가 유효하지 않습니다:", atmospheresData);
        }
        
        console.log("데이터 처리 후 던전 객체:", {
            'floors 타입': typeof dungeon.floors,
            'floors 배열여부': Array.isArray(dungeon.floors),
            'floors 길이': dungeon.floors.length,
            'structures 타입': typeof dungeon.structures,
            'structures 배열여부': Array.isArray(dungeon.structures),
            'atmospheres 타입': typeof dungeon.atmospheres,
            'atmospheres 배열여부': Array.isArray(dungeon.atmospheres)
        });
        
        console.log("기본 던전 데이터 로드 완료");
        
        // 몬스터 데이터는 필요할 때 로드하도록 함
    } catch (error) {
        console.error("던전 데이터 로드 중 오류 발생:", error);
        throw error;
    }
}

// 몬스터 데이터 로드 함수
async function loadMonsterData(type) {
    try {
        if (monsters[type] && monsters[type].length > 0) {
            // 이미 로드된 데이터가 있으면 재사용
            console.log(`${type} 몬스터 데이터 이미 로드됨`);
            return monsters[type];
        }
        
        console.log(`${type} 몬스터 데이터 로드 시작`);
        const basePath = getBasePath();
        
        // 몬스터 데이터 로드
        const monsterResponse = await fetch(`${basePath}data/dungeon/monster/${type}.json`);
        if (!monsterResponse.ok) {
            throw new Error(`몬스터 데이터 로드 실패: ${monsterResponse.status}`);
        }
        
        // 응답을 JSON으로 변환
        const monsterData = await monsterResponse.json();
        console.log(`${type} 몬스터 데이터 구조:`, JSON.stringify(monsterData).slice(0, 100) + "...");
        
        // 데이터 검증 및 처리
        if (monsterData && typeof monsterData === 'object') {
            // 객체인 경우 monsters 속성이 있는지 확인
            if (Array.isArray(monsterData.monsters)) {
                monsters[type] = monsterData.monsters;
                
                // element 필드 검증 (선택 사항)
                if (monsterData.element && monsterData.element !== type) {
                    console.warn(`경고: ${type}.json의 element 값(${monsterData.element})이 파일명과 일치하지 않습니다.`);
                }
            } else if (Array.isArray(monsterData)) {
                monsters[type] = monsterData;
            } else {
                monsters[type] = []; // 비어있는 배열로 기본값 설정
                console.error(`유효한 ${type} 몬스터 데이터가 없습니다:`, monsterData);
            }
        } else {
            monsters[type] = [];
            console.error(`${type} 몬스터 데이터가 유효하지 않습니다:`, monsterData);
        }
        
        console.log(`${type} 몬스터 배열 타입:`, typeof monsters[type]);
        console.log(`${type} 몬스터 배열 여부:`, Array.isArray(monsters[type]));
        console.log(`${type} 몬스터 데이터 길이:`, monsters[type].length);
        console.log(`${type} 몬스터 데이터 로드 완료`);
        
        return monsters[type];
    } catch (error) {
        console.error(`${type} 몬스터 데이터 로드 중 오류 발생:`, error);
        throw error;
    }
}

// 폼 초기화 함수
function initializeForm() {
    console.log("폼 초기화 시작");
    
    // 던전 데이터 확인
    console.log("던전 객체 타입 확인:", {
        'floors 타입': typeof dungeon.floors,
        'floors 배열여부': Array.isArray(dungeon.floors),
        'structures 타입': typeof dungeon.structures,
        'structures 배열여부': Array.isArray(dungeon.structures),
        'atmospheres 타입': typeof dungeon.atmospheres,
        'atmospheres 배열여부': Array.isArray(dungeon.atmospheres)
    });
    
    try {
        // 층수 옵션 초기화
        const floorsSelect = document.getElementById('dungeon-floors');
        if (!floorsSelect) {
            console.error("dungeon-floors 요소를 찾을 수 없습니다");
            return;
        }
        
        floorsSelect.innerHTML = '';
        
        if (!Array.isArray(dungeon.floors)) {
            console.error("dungeon.floors가 배열이 아닙니다:", dungeon.floors);
            // 임시 데이터로 채우기
            const tempFloors = [
                { value: "1", name: "1층" },
                { value: "3", name: "3층" },
                { value: "5", name: "5층" }
            ];
            dungeon.floors = tempFloors;
        }
        
        dungeon.floors.forEach(floor => {
            try {
                const option = document.createElement('option');
                option.value = floor.value || "1";
                option.textContent = floor.name || "기본층";
                floorsSelect.appendChild(option);
            } catch (e) {
                console.error("층수 옵션 생성 중 오류:", e, "floor 데이터:", floor);
            }
        });
        
        // 구조 옵션 초기화
        const structureSelect = document.getElementById('dungeon-structure');
        if (!structureSelect) {
            console.error("dungeon-structure 요소를 찾을 수 없습니다");
            return;
        }
        
        structureSelect.innerHTML = '';
        
        if (!Array.isArray(dungeon.structures)) {
            console.error("dungeon.structures가 배열이 아닙니다:", dungeon.structures);
            // 임시 데이터로 채우기
            const tempStructures = [
                { id: "cave", name: "동굴" },
                { id: "castle", name: "성" }
            ];
            dungeon.structures = tempStructures;
        }
        
        dungeon.structures.forEach(structure => {
            try {
                const option = document.createElement('option');
                option.value = structure.id || "default";
                option.textContent = structure.name || "기본구조";
                structureSelect.appendChild(option);
            } catch (e) {
                console.error("구조 옵션 생성 중 오류:", e, "structure 데이터:", structure);
            }
        });
        
        // 분위기 옵션 초기화
        const atmosphereSelect = document.getElementById('dungeon-atmosphere');
        if (!atmosphereSelect) {
            console.error("dungeon-atmosphere 요소를 찾을 수 없습니다");
            return;
        }
        
        atmosphereSelect.innerHTML = '';
        
        if (!Array.isArray(dungeon.atmospheres)) {
            console.error("dungeon.atmospheres가 배열이 아닙니다:", dungeon.atmospheres);
            // 임시 데이터로 채우기
            const tempAtmospheres = [
                { id: "fire", name: "화염의 던전" },
                { id: "water", name: "수중의 던전" }
            ];
            dungeon.atmospheres = tempAtmospheres;
        }
        
        dungeon.atmospheres.forEach(atmosphere => {
            try {
                const option = document.createElement('option');
                option.value = atmosphere.id || "default";
                option.textContent = atmosphere.name || "기본분위기";
                atmosphereSelect.appendChild(option);
            } catch (e) {
                console.error("분위기 옵션 생성 중 오류:", e, "atmosphere 데이터:", atmosphere);
            }
        });
        
        console.log("폼 초기화 완료");
    } catch (error) {
        console.error("폼 초기화 중 오류 발생:", error);
        alert("폼 초기화 중 오류가 발생했습니다. 개발자 도구를 확인해주세요.");
    }
}

// 던전 생성 함수
async function generateDungeon() {
    console.log("던전 생성 함수 실행");
    try {
        // 선택된 값 가져오기
        const floors = document.getElementById('dungeon-floors').value;
        const structure = document.getElementById('dungeon-structure').value;
        const atmosphere = document.getElementById('dungeon-atmosphere').value;
        
        console.log("선택된 값:", floors, structure, atmosphere);
        
        // 던전 정보 업데이트
        const structureName = document.getElementById('dungeon-structure').options[document.getElementById('dungeon-structure').selectedIndex].text;
        const atmosphereName = document.getElementById('dungeon-atmosphere').options[document.getElementById('dungeon-atmosphere').selectedIndex].text;
        
        document.getElementById('dungeon-info').innerHTML = `
            <p><strong>던전 이름:</strong> ${atmosphereName.split(' ')[0]} ${structureName}</p>
            <p><strong>던전 층수:</strong> ${floors}층</p>
            <p><strong>던전 구조:</strong> ${structureName}</p>
            <p><strong>던전 분위기:</strong> ${atmosphereName}</p>
        `;
        
        // 몬스터 데이터 로드
        const atmosphereMonsters = await loadMonsterData(atmosphere);
        
        // 몬스터 필터링
        const compatibleTypes = structureCompatibility[structure];
        
        // 구조와 분위기에 맞는 몬스터 필터링
        const availableMonsters = atmosphereMonsters.filter(monster => 
            compatibleTypes.some(type => monster.type.includes(type))
        );
        
        // 선택 가능한 몬스터 표시
        displayAvailableMonsters(availableMonsters);
        
        // 선택된 몬스터 초기화
        selectedMonsters = [];
        updateSelectedMonsters();
        
        // 결과 컨테이너 표시
        document.getElementById('result-container').style.display = 'block';
        
        console.log("던전 생성 완료");
    } catch (error) {
        console.error("던전 생성 중 오류 발생:", error);
        alert("던전 생성 중 오류가 발생했습니다: " + error.message);
    }
}

// 선택 가능한 몬스터 표시 함수
function displayAvailableMonsters(monsters) {
    const container = document.getElementById('available-monsters-grid');
    container.innerHTML = '';
    
    if (monsters.length === 0) {
        container.innerHTML = '<p>이 조합에 적합한 몬스터가 없습니다. 다른 구조나 분위기를 선택해 보세요.</p>';
        return;
    }
    
    monsters.forEach(monster => {
        const card = document.createElement('div');
        card.className = 'monster-card';
        card.dataset.monsterId = monster.id;
        
        card.innerHTML = `
            <div class="monster-icon">${monster.icon}</div>
            <div class="monster-details">
                <div class="monster-name">${monster.name}</div>
                <div class="monster-type">${monster.type} · ${monster.rarity}</div>
            </div>
        `;
        
        card.addEventListener('click', function() {
            toggleMonsterSelection(monster);
            this.classList.toggle('selected');
        });
        
        container.appendChild(card);
    });
}

// 몬스터 선택 토글 함수
function toggleMonsterSelection(monster) {
    const index = selectedMonsters.findIndex(m => m.id === monster.id);
    
    if (index === -1) {
        // 몬스터 추가
        selectedMonsters.push(monster);
    } else {
        // 몬스터 제거
        selectedMonsters.splice(index, 1);
    }
    
    updateSelectedMonsters();
}

// 선택된 몬스터 목록 업데이트 함수
function updateSelectedMonsters() {
    const container = document.getElementById('selected-monsters-list');
    container.innerHTML = '';
    
    if (selectedMonsters.length === 0) {
        container.innerHTML = '<li>아직 선택된 몬스터가 없습니다. 위의 목록에서 몬스터를 선택하세요.</li>';
        return;
    }
    
    selectedMonsters.forEach(monster => {
        const item = document.createElement('li');
        
        item.innerHTML = `
            <div class="monster-info">
                <div class="monster-icon">${monster.icon}</div>
                <div>
                    <div class="monster-name">${monster.name}</div>
                    <div class="monster-type">${monster.type} · ${monster.rarity}</div>
                </div>
            </div>
            <button class="remove-monster" data-monster-id="${monster.id}">제거</button>
        `;
        
        container.appendChild(item);
    });
    
    // 제거 버튼에 이벤트 리스너 추가
    document.querySelectorAll('.remove-monster').forEach(button => {
        button.addEventListener('click', function() {
            const monsterId = parseInt(this.dataset.monsterId);
            removeMonster(monsterId);
        });
    });
}

// 몬스터 제거 함수
function removeMonster(monsterId) {
    const index = selectedMonsters.findIndex(m => m.id === monsterId);
    
    if (index !== -1) {
        selectedMonsters.splice(index, 1);
        updateSelectedMonsters();
        
        // 선택 가능한 몬스터 목록에서도 선택 상태 제거
        const card = document.querySelector(`.monster-card[data-monster-id="${monsterId}"]`);
        if (card) {
            card.classList.remove('selected');
        }
    }
}

// 결과 출력 생성 함수
function createResultOutput() {
    const floorValue = document.getElementById('dungeon-floors').value;
    const structureName = document.getElementById('dungeon-structure').options[document.getElementById('dungeon-structure').selectedIndex].text;
    const atmosphereName = document.getElementById('dungeon-atmosphere').options[document.getElementById('dungeon-atmosphere').selectedIndex].text;
    
    let resultText = `[던전 정보]\n`;
    resultText += `던전 이름: ${atmosphereName.split(' ')[0]} ${structureName}\n`;
    resultText += `던전 층수: ${floorValue}층\n`;
    resultText += `던전 구조: ${structureName}\n`;
    resultText += `던전 분위기: ${atmosphereName}\n\n`;
    
    resultText += `[등장 몬스터]\n`;
    if (selectedMonsters.length === 0) {
        resultText += `선택된 몬스터가 없습니다.`;
    } else {
        selectedMonsters.forEach(monster => {
            resultText += `${monster.icon} ${monster.name} (${monster.type}, ${monster.rarity})\n`;
        });
    }
    
    // 결과 표시 영역 확인
    let resultOutput = document.getElementById('result-output');
    if (!resultOutput) {
        // 없으면 생성
        resultOutput = document.createElement('div');
        resultOutput.id = 'result-output';
        resultOutput.className = 'markdown-result';
        document.getElementById('selected-monsters').after(resultOutput);
    }
    
    // 내용 업데이트
    resultOutput.innerHTML = `
        <h3>던전 결과</h3>
        <pre id="dungeon-result-text" class="result-textarea">${resultText}</pre>
        <button id="copy-result-btn" class="copy-btn">결과 복사하기</button>
    `;
    
    // 복사하기 버튼 이벤트
    document.getElementById('copy-result-btn').addEventListener('click', function() {
        // 텍스트를 가져오기 위한 임시 textarea 생성
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = resultText;
        tempTextarea.style.position = 'fixed';  // 화면 밖으로 위치시키기
        tempTextarea.style.opacity = '0';
        document.body.appendChild(tempTextarea);
        
        // 텍스트 선택 및 복사
        tempTextarea.select();
        tempTextarea.setSelectionRange(0, 99999); // 모바일 지원
        
        try {
            // execCommand 방식 사용 (호환성 좋음)
            const successful = document.execCommand('copy');
            
            if (successful) {
                // 복사 성공 시 버튼 스타일과 텍스트 변경
                const copyBtn = document.getElementById('copy-result-btn');
                const originalText = copyBtn.textContent;
                const originalBg = copyBtn.style.background;
                
                copyBtn.textContent = '복사 완료! ✨';
                copyBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
                
                // 2초 후 원래 스타일로 복원
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.style.background = originalBg;
                }, 2000);
            } else {
                alert('복사하지 못했습니다. 텍스트를 직접 선택하여 복사해주세요.');
            }
        } catch (err) {
            console.error('복사 중 오류 발생:', err);
            alert('복사하지 못했습니다. 텍스트를 직접 선택하여 복사해주세요.');
        } finally {
            // 임시 textarea 제거
            document.body.removeChild(tempTextarea);
        }
    });
}
