/**
 * world-generator.js - 판타지 툴킷의 세계 생성기 스크립트
 * 세계 생성에 필요한 데이터를 불러오고 세계를 생성하는 기능을 담당합니다
 */

// 전역 변수 및 상태 관리
let selectedOptions = {
    atmosphere: "random",
    geography: "random",
    technology: "random",
    magic: "random",
    races: [],
    resources: []
};

// DOM이 완전히 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 앱 초기화
    initializeApp();
    
    // 고급 옵션 토글
    const advancedToggle = document.getElementById('advancedToggle');
    const advancedOptions = document.getElementById('advancedOptions');
    
    if (advancedToggle && advancedOptions) {
        advancedToggle.addEventListener('click', function() {
            if (advancedOptions.style.display === 'none') {
                advancedOptions.style.display = 'block';
                advancedToggle.textContent = '고급 옵션 ▲';
            } else {
                advancedOptions.style.display = 'none';
                advancedToggle.textContent = '고급 옵션 ▼';
            }
        });
    }
    
    // 세계 생성 버튼 이벤트 리스너
    const generateButton = document.getElementById('generateWorld');
    if (generateButton) {
        generateButton.addEventListener('click', function() {
            generateWorld(selectedOptions);
        });
    }
});

// 앱 초기화 함수
async function initializeApp() {
    try {
        // 필터 초기화
        await initializeFilters();
    } catch (error) {
        console.error("앱 초기화 중 오류 발생:", error);
        alert("데이터를 불러오는 중 오류가 발생했습니다. 페이지를 새로고침하거나 나중에 다시 시도해주세요.");
    }
}

// 로딩 상태 표시 함수
function showLoading(message) {
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading-overlay';
    loadingEl.innerHTML = `
        <div class="loading-spinner"></div>
        <p>${message}</p>
    `;
    document.body.appendChild(loadingEl);
    return loadingEl;
}

// 로딩 화면 숨김 함수
function hideLoading(loadingEl) {
    if (loadingEl) {
        document.body.removeChild(loadingEl);
    }
}

// 필터 데이터 로드 및 설정
async function initializeFilters() {
    const loadingIndicator = showLoading('마법의 필터를 준비하는 중...');
    
    try {
        // 데이터 가져오기
        const worldData = await fetchWorldData();
        
        // 각 필터 초기화
        initializeFilter('atmosphere', worldData.atmospheres, atmosphereCallback);
        initializeFilter('geography', worldData.geographies, geographyCallback);
        initializeFilter('technology', worldData.technologies, technologyCallback);
        initializeFilter('magic', worldData.magics, magicCallback);
        
        // 종족 멀티 셀렉트 초기화
        initializeMultiSelect('races', worldData.races);
        
        // 자원 멀티 셀렉트 초기화
        initializeMultiSelect('resources', worldData.resources);
        
    } catch (error) {
        console.error('필터 초기화 중 오류 발생:', error);
    } finally {
        hideLoading(loadingIndicator);
    }
}

// 일반 필터 초기화 함수
function initializeFilter(type, data, callback) {
    const filter = document.getElementById(`${type}Filter`);
    const description = document.getElementById(`${type}Description`);
    
    if (!filter || !description) return;
    
    // 기본 옵션 (랜덤) 유지
    
    // 각 필터 옵션 추가 (random 키는 건너뜀)
    Object.keys(data).forEach(key => {
        if (key !== 'random') {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = data[key].name || data[key];
            filter.appendChild(option);
        }
    });
    
    // 이벤트 리스너 추가
    filter.addEventListener('change', function() {
        const value = this.value;
        selectedOptions[type] = value;
        
        // 콜백 함수 실행 (설명 업데이트)
        if (callback) {
            callback(value, data, description);
        }
    });
}

// 멀티 셀렉트 초기화 함수
function initializeMultiSelect(type, items) {
    const filter = document.getElementById(`${type}Filter`);
    
    if (!filter) return;
    
    // 각 항목 추가
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.name;
        option.textContent = item.name;
        filter.appendChild(option);
    });
    
    // 이벤트 리스너 추가
    filter.addEventListener('change', function() {
        const selectedValues = Array.from(this.selectedOptions).map(option => option.value);
        selectedOptions[type] = selectedValues;
    });
}

// 콜백 함수들 - 필터 설명 업데이트
function atmosphereCallback(value, data, descriptionElement) {
    if (value === 'random') {
        descriptionElement.textContent = '분위기를 랜덤으로 선택합니다.';
    } else {
        descriptionElement.textContent = data[value].description || '선택한 분위기에 대한 설명이 없습니다.';
    }
}

function geographyCallback(value, data, descriptionElement) {
    if (value === 'random') {
        descriptionElement.textContent = '지리적 특성을 랜덤으로 선택합니다.';
    } else {
        descriptionElement.textContent = data[value].description || '선택한 지리에 대한 설명이 없습니다.';
    }
}

function technologyCallback(value, data, descriptionElement) {
    if (value === 'random') {
        descriptionElement.textContent = '기술 수준을 랜덤으로 선택합니다.';
    } else {
        descriptionElement.textContent = data[value].description || '선택한 기술 수준에 대한 설명이 없습니다.';
    }
}

function magicCallback(value, data, descriptionElement) {
    if (value === 'random') {
        descriptionElement.textContent = '마법 수준을 랜덤으로 선택합니다.';
    } else {
        descriptionElement.textContent = data[value].description || '선택한 마법 수준에 대한 설명이 없습니다.';
    }
}

// 세계 데이터 불러오기 함수
async function fetchWorldData() {
    try {
        // 기본 경로 설정
        const basePath = getBasePath();
        console.log('데이터 경로:', basePath);
        
        // 각 JSON 파일 불러오기
        const namesResponse = await fetch(`${basePath}data/world/world_names.json`);
        const atmospheresResponse = await fetch(`${basePath}data/world/atmospheres.json`);
        const geographiesResponse = await fetch(`${basePath}data/world/geographies.json`);
        const technologiesResponse = await fetch(`${basePath}data/world/technologies.json`);
        const magicsResponse = await fetch(`${basePath}data/world/magics.json`);
        const racesResponse = await fetch(`${basePath}data/world/races.json`);
        const resourcesResponse = await fetch(`${basePath}data/world/resources.json`);
        const templatesResponse = await fetch(`${basePath}data/world/world_templates.json`);
        
        // 응답 상태 확인
        if (!namesResponse.ok || !atmospheresResponse.ok || !geographiesResponse.ok || 
            !technologiesResponse.ok || !magicsResponse.ok || !racesResponse.ok || 
            !resourcesResponse.ok || !templatesResponse.ok) {
            throw new Error('일부 데이터 파일을 불러오는데 실패했습니다.');
        }
        
        // JSON으로 변환
        const names = await namesResponse.json();
        const atmospheres = await atmospheresResponse.json();
        const geographies = await geographiesResponse.json();
        const technologies = await technologiesResponse.json();
        const magics = await magicsResponse.json();
        const races = await racesResponse.json();
        const resources = await resourcesResponse.json();
        const templates = await templatesResponse.json();
        
        console.log('모든 세계 데이터 로드 완료!');
        
        // 모든 데이터를 하나의 객체로 결합
        return {
            names,
            atmospheres,
            geographies,
            technologies,
            magics,
            races: races.races,
            resources: resources.resources,
            templates: templates.templates
        };
    } catch (error) {
        console.error('데이터 로딩 중 오류 발생:', error);
        
        // 오류 발생 시에도 알림을 표시하도록 추가
        alert('데이터를 불러오는 중 오류가 발생했습니다. 페이지를 새로고침하거나 나중에 다시 시도해주세요.');
        
        // 대체 데이터는 그대로 유지 (로컬 개발용)
        return {
            names: {
                prefixes: ['아리', '엘', '테', '크로', '감', '드라', '실', '루', '미', '발'],
                suffixes: ['아나', '리아', '론', '니스', '도르', '가드', '타니아', '헤임', '란', '리온']
            },
            atmospheres: {
                bright: { name: '밝고 희망적인', description: '항상 밝은 빛이 비추고 희망이 넘치는' },
                dark: { name: '어둡고 음울한', description: '그림자가 드리워진 음울한 분위기의' },
                mysterious: { name: '신비롭고 초자연적인', description: '비밀과 수수께끼로 가득한 초자연적인' },
                magical: { name: '마법이 넘치는', description: '마법의 기운이 공기 중에 흐르는' },
                steampunk: { name: '증기와 기계가 공존하는', description: '증기 기관과 톱니바퀴가 작동하는' },
                random: [
                    { name: '평화로운', description: '평화와 안정이 깃든' },
                    { name: '혼돈스러운', description: '끊임없이 변화하고 예측할 수 없는' },
                    { name: '우주적인', description: '별들과 우주의 신비로 가득한' }
                ]
            },
            geographies: {
                island: { name: '거대한 섬', description: '사방이 바다로 둘러싸인 거대한 섬으로 이루어진' },
                continent: { name: '광활한 대륙', description: '끝없이 펼쳐진 광활한 대륙으로 이루어진' },
                archipelago: { name: '수많은 섬으로 이루어진 군도', description: '크고 작은 수백 개의 섬으로 구성된' },
                floating: { name: '하늘에 떠 있는 땅', description: '구름 위에 떠 있는 신비로운 땅으로 구성된' },
                underground: { name: '깊고 넓은 지하 세계', description: '지표면 아래 깊숙이 펼쳐진 거대한 동굴 네트워크로 이루어진' }
            },
            technologies: {
                primitive: { name: '원시적인', description: '돌과 나무로 만든 도구를 사용하는' },
                medieval: { name: '중세 수준의', description: '철제 무기와 갑옷을 다루는 기술을 가진' },
                renaissance: { name: '르네상스 시대의', description: '예술과 과학이 발달하기 시작한' },
                industrial: { name: '산업혁명 시기의', description: '증기 기관과 공장이 등장한' },
                futuristic: { name: '미래적인', description: '고도로 발달된 과학 기술을 가진' }
            },
            magics: {
                none: { name: '마법이 존재하지 않는', description: '초자연적인 힘이 없이 과학과 논리만이 지배하는' },
                rare: { name: '마법이 희귀한', description: '소수의 선택받은 사람들만이 마법을 다룰 수 있는' },
                common: { name: '마법이 일상적인', description: '많은 사람들이 일상 생활에서 마법을 사용하는' },
                abundant: { name: '마법이 필수적인', description: '마법 없이는 사회가 기능할 수 없을 정도로 마법이 깊게 뿌리내린' },
                technological: { name: '마법과 기술이 융합된', description: '과학과 마법이 하나로 결합되어 발전한' }
            },
            races: [
                { name: '인간', description: '적응력이 뛰어나고 창의적인 종족' },
                { name: '엘프', description: '자연과 조화를 이루며 오래 사는 종족' },
                { name: '드워프', description: '산과 지하에 거주하며 장인 정신이 강한 종족' },
                { name: '오크', description: '강인한 체력과 전사의 기질을 가진 종족' },
                { name: '요정', description: '작고 날개를 가진 마법에 능한 종족' },
                { name: '고블린', description: '꾀가 많고 장난을 좋아하는 녹색 피부의 종족' },
                { name: '언데드', description: '죽음을 초월한 영혼을 가진 종족' }
            ],
            resources: [
                { name: '마나 크리스탈', description: '마법 에너지를 저장하고 변환할 수 있는 희귀한 광물' },
                { name: '월광 금속', description: '달빛을 받으면 빛나며 강해지는 특이한 금속' },
                { name: '하늘나무', description: '구름처럼 가볍지만 강철보다 단단한 희귀한 나무' },
                { name: '용의 비늘', description: '극도로 내열성이 강하고 빛을 반사하는 재료' },
                { name: '정령석', description: '자연의 정령이 깃든 신비로운 보석' }
            ],
            templates: [
                "{name}은(는) {geography} 세계입니다. {technology} 기술 수준을 가진 이곳은 {atmosphere} 분위기가 특징이며, {magic} 마법이 존재합니다. {races}이(가) 주요 종족으로 살고 있으며, {resources}와(과) 같은 귀중한 자원이 발견됩니다. 각 지역마다 독특한 문화와 역사가 있어 모험가들에게 무한한 탐험의 기회를 제공합니다.",
                
                "{atmosphere} 분위기의 {name} 세계는 {geography} 특성을 지니고 있습니다. 이곳의 주민들은 {technology} 기술을 발전시켰으며, {magic} 마법을 다룹니다. {races} 종족들이 이 세계의 주인이며, {resources} 같은 특별한 자원들을 활용해 문명을 발전시켰습니다. 이곳의 역사는 깊고 풍부하며, 아직 밝혀지지 않은 비밀이 많습니다.",
                
                "{name}의 세계는 {geography}로 구성되어 있으며, {atmosphere} 분위기가 항상 감돌고 있습니다. {races} 종족들은 {technology} 기술과 {magic} 마법을 결합하여 독특한 문화를 이루었습니다. 이 세계에서는 {resources}와(과) 같은 자원이 문명의 발전에 중요한 역할을 합니다. 여행자들은 이 세계의 경이로움에 압도되곤 합니다."
            ]
        };
    }
}

// 경로 기본 경로 가져오기 함수
function getBasePath() {
    const pathParts = window.location.pathname.split('/');
    let basePath = '/';
    
    // MobJAKO-CHAGEN이 경로에 있는지 확인
    const repoIndex = pathParts.indexOf('MobJAKO-CHAGEN');
    
    if (repoIndex !== -1) {
        // 경로에 MobJAKO-CHAGEN이 있는 경우, 해당 부분까지의 경로 사용
        basePath = '/' + pathParts.slice(1, repoIndex + 1).join('/') + '/';
    }
    
    console.log('계산된 기본 경로:', basePath);
    return basePath;
}

// 배열에서 랜덤 요소 하나 선택
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// 배열에서 여러 개의 랜덤 요소 선택
function getRandomElements(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// 세계 생성 함수
async function generateWorld(options) {
    const loadingIndicator = showLoading('✨ 마법의 세계를 창조하는 중... ✨');
    
    try {
        // 세계 데이터 불러오기
        const worldData = await fetchWorldData();
        
        // 랜덤 이름 생성
        const prefix = getRandomElement(worldData.names.prefixes);
        const suffix = getRandomElement(worldData.names.suffixes);
        const name = prefix + suffix;
        
        // 선택된 옵션들에서 값 가져오기 (랜덤이면 랜덤 선택)
        let atmosphere, geography, technology, magic;
        
        // 분위기 선택
        if (options.atmosphere === 'random') {
            const allAtmospheres = [...Object.keys(worldData.atmospheres).filter(k => k !== 'random')];
            const randomKey = getRandomElement(allAtmospheres);
            atmosphere = worldData.atmospheres[randomKey].name;
        } else {
            atmosphere = worldData.atmospheres[options.atmosphere].name;
        }
        
        // 지리 선택
        if (options.geography === 'random') {
            const allGeographies = [...Object.keys(worldData.geographies).filter(k => k !== 'random')];
            const randomKey = getRandomElement(allGeographies);
            geography = worldData.geographies[randomKey].name;
        } else {
            geography = worldData.geographies[options.geography].name;
        }
        
        // 기술 선택
        if (options.technology === 'random') {
            const allTechnologies = [...Object.keys(worldData.technologies).filter(k => k !== 'random')];
            const randomKey = getRandomElement(allTechnologies);
            technology = worldData.technologies[randomKey].name;
        } else {
            technology = worldData.technologies[options.technology].name;
        }
        
        // 마법 선택
        if (options.magic === 'random') {
            const allMagics = [...Object.keys(worldData.magics).filter(k => k !== 'random')];
            const randomKey = getRandomElement(allMagics);
            magic = worldData.magics[randomKey].name;
        } else {
            magic = worldData.magics[options.magic].name;
        }
        
        // 종족 선택 (선택되지 않았다면 랜덤 3개)
        let races;
        if (options.races.length === 0) {
            races = getRandomElements(worldData.races, 3).map(r => r.name);
        } else {
            races = options.races;
        }
        
        // 자원 선택 (선택되지 않았다면 랜덤 3개)
        let resources;
        if (options.resources.length === 0) {
            resources = getRandomElements(worldData.resources, 3).map(r => r.name);
        } else {
            resources = options.resources;
        }
        
        // 세계 설명 생성
        const description = generateWorldDescription(
            name, atmosphere, geography, technology, magic, 
            races, resources, worldData.templates
        );
        
        // 결과 표시
        displayWorldResult(name, atmosphere, geography, technology, magic, races, resources, description);
        
    } catch (error) {
        console.error('세계 생성 중 오류:', error);
        alert('세계를 생성하는 데 문제가 발생했어요. 다시 시도해주세요!');
    } finally {
        hideLoading(loadingIndicator);
    }
}

// 세계 설명 생성
function generateWorldDescription(name, atmosphere, geography, technology, magic, races, resources, templates) {
    const racesText = races.length > 1 
        ? races.slice(0, -1).join(', ') + '와(과) ' + races[races.length - 1]
        : races[0];
    
    const resourcesText = resources.length > 1 
        ? resources.slice(0, -1).join(', ') + '와(과) ' + resources[resources.length - 1]
        : resources[0];
    
    // 랜덤 템플릿 선택
    const template = getRandomElement(templates);
    
    // 템플릿에 값 채우기
    return template
        .replace('{name}', name)
        .replace('{atmosphere}', atmosphere)
        .replace('{geography}', geography)
        .replace('{technology}', technology)
        .replace('{magic}', magic)
        .replace('{races}', racesText)
        .replace('{resources}', resourcesText);
}

// 결과 표시 함수
function displayWorldResult(name, atmosphere, geography, technology, magic, races, resources, description) {
    document.getElementById('worldName').textContent = name;
    document.getElementById('atmosphereResult').textContent = atmosphere;
    document.getElementById('geographyResult').textContent = geography;
    document.getElementById('technologyResult').textContent = technology;
    document.getElementById('magicResult').textContent = magic;
    document.getElementById('racesResult').textContent = races.join(', ');
    document.getElementById('resourcesResult').textContent = resources.join(', ');
    document.getElementById('worldDescription').textContent = description;
    
    // 결과 영역 표시
    const resultElement = document.getElementById('worldResult');
    resultElement.classList.add('visible');
    resultElement.scrollIntoView({ behavior: 'smooth' });
    
    // 이전 이벤트 리스너 제거 (중복 방지)
    const copyButton = document.querySelector('.copy-button');
    const saveButton = document.querySelector('.save-button');
    
    copyButton.replaceWith(copyButton.cloneNode(true));
    saveButton.replaceWith(saveButton.cloneNode(true));
    
    // 새 이벤트 리스너 등록
    document.querySelector('.copy-button').addEventListener('click', function() {
        const textToCopy = `${name}\n\n` +
            `분위기: ${atmosphere}\n` +
            `지리: ${geography}\n` +
            `기술 수준: ${technology}\n` +
            `마법 수준: ${magic}\n` +
            `주요 종족: ${races.join(', ')}\n` +
            `자원: ${resources.join(', ')}\n\n` +
            `설명:\n${description}`;
        
        navigator.clipboard.writeText(textToCopy)
            .then(() => alert('세계 정보가 클립보드에 복사되었습니다!'))
            .catch(err => console.error('클립보드에 복사하는 데 실패했습니다:', err));
    });
    
    // 저장 버튼 - 로컬 스토리지에 저장
    document.querySelector('.save-button').addEventListener('click', function() {
        const worldData = {
            name,
            atmosphere,
            geography,
            technology, 
            magic,
            races,
            resources,
            description,
            created: new Date().toISOString()
        };
        
        // 기존 저장된 세계들 불러오기
        let savedWorlds = JSON.parse(localStorage.getItem('fantasyWorlds') || '[]');
        
        // 새 세계 추가
        savedWorlds.push(worldData);
        
        // 저장
        localStorage.setItem('fantasyWorlds', JSON.stringify(savedWorlds));
        
        alert('세계가 저장되었습니다!');
    });
}
