/**
 * dictionary-debug.js - 통합 사용자 사전 디버깅 스크립트
 * 이 파일을 utility/js/dictionary-debug.js로 저장하세요
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('사전 디버깅 스크립트 로드됨');
    
    // 사전 폼 클릭 이벤트 추가
    const dictionaryForm = document.getElementById('dictionary-form');
    if (dictionaryForm) {
        console.log('사전 폼 발견됨, 이벤트 설정');
        
        // onsubmit 속성 명시적 설정
        dictionaryForm.setAttribute('onsubmit', 'return false;');
        
        // 제출 이벤트 차단
        dictionaryForm.addEventListener('submit', function(e) {
            console.log('사전 폼 제출 이벤트 발생, 차단됨');
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        
        // 버튼 타입 변경 및 이벤트 추가
        const addDictionaryBtn = document.getElementById('add-dictionary-btn') || 
                                dictionaryForm.querySelector('.add-entry-btn');
        
        if (addDictionaryBtn) {
            console.log('사전 추가 버튼 발견, 이벤트 설정');
            
            // 명시적으로 버튼 타입을 button으로 설정
            addDictionaryBtn.setAttribute('type', 'button');
            
            // 클릭 이벤트 추가
            addDictionaryBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('사전 추가 버튼 클릭됨');
                
                // window.dictionaryManager 객체를 통해 추가 함수 호출
                if (window.dictionaryManager && typeof window.dictionaryManager.addDictionaryEntry === 'function') {
                    window.dictionaryManager.addDictionaryEntry();
                } else {
                    // 로컬 스코프에서 직접 접근 시도
                    if (typeof addDictionaryEntry === 'function') {
                        addDictionaryEntry();
                    } else {
                        console.error('addDictionaryEntry 함수를 찾을 수 없음');
                        
                        // 직접 구현된 폴백 함수
                        const sourceInput = document.getElementById('dict-source');
                        const targetInput = document.getElementById('dict-target');
                        
                        if (sourceInput && targetInput) {
                            const source = sourceInput.value.trim();
                            const target = targetInput.value.trim();
                            
                            if (!source || !target) {
                                alert('원본 텍스트와 번역 텍스트를 모두 입력해주세요.');
                                return;
                            }
                            
                            alert(`사전 항목 추가 시도: "${source}" → "${target}"\n(사전 모듈을 찾을 수 없어 저장되지 않을 수 있습니다)`);
                            console.log('사전 항목 추가 시도:', source, '->', target);
                        }
                    }
                }
                
                return false;
            });
        } else {
            console.warn('사전 추가 버튼을 찾을 수 없음');
        }
    } else {
        console.warn('사전 폼(dictionary-form)을 찾을 수 없음');
    }
    
    // 번역 폼 제출 이벤트 확인
    const translationForm = document.getElementById('translation-form');
    if (translationForm) {
        translationForm.addEventListener('submit', function(e) {
            console.log('번역 폼 제출 이벤트 발생');
            
            // 사전 관련 항목 확인
            if (window.dictionaryManager) {
                console.log('번역 전 사전 정보:');
                if (typeof window.dictionaryManager.printDictionary === 'function') {
                    window.dictionaryManager.printDictionary();
                }
            }
        });
    }
    
    // 디버깅을 위한 전역 객체 콘솔에 노출
    window.debugDictionary = function() {
        console.log('=== 사전 디버깅 정보 ===');
        console.log('dictionaryManager 객체 존재:', window.dictionaryManager ? '예' : '아니오');
        
        if (window.dictionaryManager) {
            console.log('사전 항목 수:', window.dictionaryManager.getCount ? window.dictionaryManager.getCount() : '알 수 없음');
            console.log('사전 활성화 상태:', window.dictionaryManager.isEnabled ? window.dictionaryManager.isEnabled() : '알 수 없음');
            
            if (typeof window.dictionaryManager.printDictionary === 'function') {
                window.dictionaryManager.printDictionary();
            } else if (window.dictionaryManager.getDictionary) {
                console.log('사전 항목:', window.dictionaryManager.getDictionary());
            }
        }
        
        // HTML 요소 검사
        console.log('dictionary-form 요소 존재:', document.getElementById('dictionary-form') ? '예' : '아니오');
        console.log('add-dictionary-btn 요소 존재:', document.getElementById('add-dictionary-btn') ? '예' : '아니오');
        console.log('dictionary-entries 요소 존재:', document.getElementById('dictionary-entries') ? '예' : '아니오');
        
        // localStorage 검사
        const storedDict = localStorage.getItem('user_dictionary');
        console.log('localStorage에 사전 데이터 존재:', storedDict ? '예' : '아니오');
        if (storedDict) {
            try {
                const dictData = JSON.parse(storedDict);
                console.log('localStorage 사전 항목 수:', dictData.length);
                console.log('localStorage 사전 데이터:', dictData);
            } catch (e) {
                console.error('localStorage 사전 데이터 파싱 오류:', e);
            }
        }
    };
    
    console.log('디버깅: window.debugDictionary() 함수로 사전 정보를 콘솔에서 확인할 수 있습니다.');
});

// 페이지에 디버깅 초기화 완료 메시지 표시
console.log('사전 디버깅 스크립트 초기화 완료');
