const AirmapContainer = document.querySelector('#AirMap') // 지도를 표시할 div 
const AirmapOption = {
        center: new kakao.maps.LatLng(36.34, 127.77), // 지도의 중심좌표
        level: 13 // 지도의 초기 확대 레벨
    };

// 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
let AirMap = new kakao.maps.Map(AirmapContainer, AirmapOption);


// 마커 제거를위한 초기값 설정
let DotCounts = [];
let APDotCounts = [];

// 지도 좌표사이선 초기값 설정
let CheckLine = new kakao.maps.Polyline();
let distanceOverlay = new kakao.maps.CustomOverlay()
let Dots = new kakao.maps.CustomOverlay()

// 출도착 공항 맞는 공항좌표 조회 함수
const AirPortMark = async function (DeAirP, ArAirP) {
    let Port = await fetch('/AirPort/js/airport.json');
    let Getjsons = await Port.json();
    let DeAirPName, DeAirPXY, ArAirPName, ArAirPXY;
    for (let Getjson of Getjsons) {
        if (DeAirP === Getjson.Name) {
            DeAirPName = Getjson.Name;
            DeAirPXY = Getjson.XYmap;
        }
        if (ArAirP === Getjson.Name) {
            ArAirPName = Getjson.Name;
            ArAirPXY = Getjson.XYmap;
        }
    }
    return [DeAirPName, DeAirPXY, ArAirPName, ArAirPXY];
};


// 마커옵션 설정 함수( 좌표 설정 )
const SetDotsOP = async function (GetDirection) {
    let AirPortPositions = [
        {
            title: `${GetDirection[0]}`,
            latlng: new kakao.maps.LatLng(GetDirection[1].x, GetDirection[1].y)
        },
        {
            title: `${GetDirection[2]}`,
            latlng: new kakao.maps.LatLng(GetDirection[3].x, GetDirection[3].y)
        }
    ];
    for (Position of AirPortPositions) {
        Dots = new kakao.maps.CustomOverlay({
            content: '<span class="material-symbols-outlined Mark">fiber_manual_record</span>',
            position: Position.latlng,
            title: `${Position.title}공항`,
            zIndex: 3
        });
        Dots.setMap(AirMap);
        DotCounts.push(Dots)
    }
};
// 마커 제거 함수
function DelMarkers(AirMap) {
    // MakrerCt.setMap(null);
    for (let DotsCt of DotCounts) {
        DotsCt.setMap(AirMap);
    }
}

async function PanTo(GetDirection) {
    // 값이 문자열이라 소수점parse필요 
    let GetX = ((parseFloat(GetDirection[1].x) + parseFloat(GetDirection[3].x))/2);
    let GetY = ((parseFloat(GetDirection[1].y) + parseFloat(GetDirection[3].y))/2); 

    let moveLatLon = new kakao.maps.LatLng(GetX, GetY);
    AirMap.panTo(moveLatLon);
}

// 선택한경로 blink효과를 주기위한 함수 2개
let EXColor1 = function(){
    setTimeout(function() {
        CheckLine.setOptions({strokeColor : '#ffffff'})
        EXColor2()
    }, 500);
}
let EXColor2 = function(){
    setTimeout(function() {
        CheckLine.setOptions({strokeColor : '#000000'})
        EXColor1()
    }, 500);
}

const MakeLine = async function(GetDirection){
    CheckLine = new kakao.maps.Polyline({
        map: AirMap,
        path: [
            new kakao.maps.LatLng(GetDirection[1].x, GetDirection[1].y),
            new kakao.maps.LatLng(GetDirection[3].x, GetDirection[3].y),],
            strokeWeight: 3,
            strokeColor: '#000000',
            strokeOpacity: 0.8,
            strokeStyle: 'solid',
            zIndex : 5
        });
    CheckLine.setMap(AirMap)
    
    // 라인생성후 timeout으로 인한 깜빡임표시
    EXColor1()
}

// 보기버튼에 있는 클릭이벤트에 들어갈 함수
const MapEvents = async function () {
    // 추후시간표시를 위한 객체 콜링
    let DeAirport = document.querySelector('#SairportN').options[DeAirportBox.selectedIndex].textContent;
    let ArAirport = document.querySelector('#EairportN').options[ArAirportBox.selectedIndex].textContent;
    let GetDirection = await AirPortMark(DeAirport, ArAirport);
    PanTo(GetDirection);
    return;
};


// 처음로딩시 뿌려줄 공항 연결선
const SetLine = async function() {
    let Port = await fetch('/js/airport.json');
    let Getjsons = await Port.json();
    let AirPJsons = new Set();
    for (let Getjson of Getjsons) {
        AirPJsons.add(Getjson)
    }
    AirPJsons = [...AirPJsons];
    let ComPareAirPJsons = [...AirPJsons];
    let ComPares = '';
    for (let AirPJson of AirPJsons) {
        // 공항 표시 점들
        let AirPortDots = new kakao.maps.CustomOverlay({
            content: '<span class="material-symbols-outlined">fiber_manual_record</span>',
            position: new kakao.maps.LatLng(AirPJson.XYmap.x, AirPJson.XYmap.y),
            // title: `${Position.title}공항`,
            zIndex: 2
        });
        AirPortDots.setMap(AirMap);
        APDotCounts.push(AirPortDots)
        if (ComPares == '') {
            for (let ComPareAirPJson of ComPareAirPJsons) {
                if (AirPJson !== ComPareAirPJson) {            
                    let MapLine = new kakao.maps.Polyline({
                        map: AirMap,
                        startArrow: true,
                        endArrow: true,
                        path: [
                            new kakao.maps.LatLng(AirPJson.XYmap.x, AirPJson.XYmap.y),
                            new kakao.maps.LatLng(ComPareAirPJson.XYmap.x, ComPareAirPJson.XYmap.y),],
                            strokeWeight: 1,
                        strokeColor: '#ABABAB',
                        strokeOpacity: 0.7,
                        strokeStyle: 'solid'
                    });
                    MapLine.setMap(AirMap)
                }
                ComPares = ComPareAirPJsons.filter(ComPareAirPJson => ComPareAirPJson !== AirPJson);
            }
        } else {
            for (let ComPare of ComPares) {
                if (AirPJson !== ComPare) {
                    let MapLine = new kakao.maps.Polyline({
                        map: AirMap,
                        startArrow: true,
                        endArrow: true,
                        path: [
                            new kakao.maps.LatLng(AirPJson.XYmap.x, AirPJson.XYmap.y),
                            new kakao.maps.LatLng(ComPare.XYmap.x, ComPare.XYmap.y),],
                            strokeWeight: 1,
                            strokeColor: '#ABABAB',
                            strokeOpacity: 0.7,
                            strokeStyle: 'solid'
                        });
                    MapLine.setMap(AirMap)
                }
                ComPares = ComPares.filter(ComPareAirPJson => ComPareAirPJson !== AirPJson);
            }
        }
    }
}