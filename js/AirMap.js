const AirmapContainer = document.querySelector('#AirLineMap') // 지도를 표시할 div 
const AirOption = {
        center: new kakao.maps.LatLng(36.34, 127.77), // 지도의 중심좌표
        level: 13 // 지도의 초기 확대 레벨
    };

// 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
let AirLineMap = new kakao.maps.Map(AirmapContainer, AirOption);


// 마커 제거를위한 초기값 설정
let MakrerCts = [];

// 지도 좌표사이선 초기값 설정
let MapLine = new kakao.maps.Polyline({});
let distanceOverlay = new kakao.maps.CustomOverlay({})

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
const SetMarkerOP = async function (GetDirection) {
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
    let PortMarker = '';
    for (Position of AirPortPositions) {
        PortMarker = new kakao.maps.Marker({
            map: AirLineMap, // 마커를 표시할 지도
            position: Position.latlng, // 마커를 표시할 위치
            title: `${Position.title}공항` // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
        });
        MakrerCts.push(PortMarker);
    }
    return AirPortPositions;
};
// 마커 제거 함수
function DelMarkers(AirLineMap) {
    // MakrerCt.setMap(null);
    for (let MakrerCt of MakrerCts) {
        MakrerCt.setMap(AirLineMap);
    }
}

async function panTo(GetDirection) {
    // 값이 문자열이라 소수점parsing필요 
    let GetX = ((parseFloat(GetDirection[1].x) + parseFloat(GetDirection[3].x))/2);
    let GetY = ((parseFloat(GetDirection[1].y) + parseFloat(GetDirection[3].y))/2);
    // 이동할 위도 경도 위치를 생성합니다 
    let moveLatLon = new kakao.maps.LatLng(GetX, GetY);
    // 지도 중심을 부드럽게 이동시킵니다
    // 만약 이동할 거리가 지도 화면보다 크면 부드러운 효과 없이 이동합니다
    AirLineMap.panTo(moveLatLon);
}

const MakeLine = async function(GetDirection){
    // let ArrDiX,ArrDiY;
    // ArrDiX = (parseFloat(GetDirection[1].x) + parseFloat(GetDirection[3].x)) / 10
    // ArrDiY = (parseFloat(GetDirection[1].y) + parseFloat(GetDirection[3].y)) / 10
    // console.log(GetDirection[1].x,GetDirection[1].y,GetDirection[3].x,GetDirection[3].y)
    // MapLine = new kakao.maps.Polyline({
    //     map: AirLineMap,
    //     endArrow : true,
    //     path: [
    //         new kakao.maps.LatLng(GetDirection[1].x,GetDirection[1].y),
    //         new kakao.maps.LatLng(`${ArrDiX}`,`${ArrDiY}`),],
    //     strokeWeight: 3,
    //     strokeColor: '#FF00FF',
    //     strokeOpacity: 0.7,
    //     strokeStyle: 'solid'
    // });
    MapLine = new kakao.maps.Polyline({
        map: AirLineMap,
        endArrow : true,
        path: [
            new kakao.maps.LatLng(GetDirection[1].x, GetDirection[1].y),
            new kakao.maps.LatLng(GetDirection[3].x, GetDirection[3].y),],
            strokeWeight: 3,
            strokeColor: '#FF00FF',
            strokeOpacity: 0.7,
            strokeStyle: 'solid'
        });
        // 카카오맵 Polyline 옵션설정
        // polyline.setOptions({
        //     strokeWeight: 2,
        //     strokeColor: '#FF00FF',
        //     strokeOpacity: 0.8,
        //     strokeStyle: 'dashed'
        // }); 
    MapLine.setMap(AirLineMap)
    
    let distance = Math.round(MapLine.getLength())
    console.log(distance)
    if (distance > 1000) {
        let StrDistances = [...distance.toString()]
        let index = 0
        let Kmeter = ''
        for(StrDistance of StrDistances){
            if(index === 2){
                Kmeter += `${StrDistance}.`
            } else {
                Kmeter += `${StrDistance}`
            }
            index ++
        }
        // 클릭한 지점까지의 그려진 선의 총 거리를 표시할 커스텀 오버레이를 생성합니다
        distanceOverlay = new kakao.maps.CustomOverlay({
            content: `<div class="lineBoard">거리 <span>${Kmeter}</span>km</div>`,
            position: new kakao.maps.LatLng(GetDirection[3].x, GetDirection[3].y),
            xAnchor: 0,
            yAnchor: 0,
            zIndex: 2
        });
        
        // 지도에 표시합니다
        distanceOverlay.setMap(AirLineMap);
    }
}
// 이벤트에 들어갈 함수
const MapEvents = async function () {
    // 값 초기화
    DelMarkers();
    MakrerCts = [];
    MapLine.setMap(null)
    distanceOverlay.setMap(null)

    // 추후시간표시를 위한 객체 콜링
    let GetArTime = this.parentNode.querySelector('.ArrTime').textContent
    let GetDeTime = this.parentNode.querySelector('.DepTime').textContent
    let CompareDay = new Date().getFullYear()

    console.log(CompareDay)
    
    let DeAirport = document.querySelector('#SairportN').options[DeAirportBox.selectedIndex].textContent;
    let ArAirport = document.querySelector('#EairportN').options[ArAirportBox.selectedIndex].textContent;
    let GetDirection = await AirPortMark(DeAirport, ArAirport);
    let SetMarker = await SetMarkerOP(GetDirection);
    let MoveCenter = panTo(GetDirection);
    MakeLine(GetDirection)
    return;
};