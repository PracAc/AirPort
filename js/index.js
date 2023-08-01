const DserviceKey = "59vfsW1KPKy2hBTv9KnUrqaL0XC9YPCJS1bG8CSyhakhZuU9L1IuvN%2BPqcvlb3uW2gFXe8zF0je%2F1b%2BtI061Yw%3D%3D";
const EserviceKey = "59vfsW1KPKy2hBTv9KnUrqaL0XC9YPCJS1bG8CSyhakhZuU9L1IuvN+Pqcvlb3uW2gFXe8zF0je/1b+tI061Yw==";
const AirCompanyUrl = `https://apis.data.go.kr/1613000/DmstcFlightNvgInfoService/getAirmanList?serviceKey=${DserviceKey}&_type=json`;
const airportUrl = `https://apis.data.go.kr/1613000/DmstcFlightNvgInfoService/getArprtList?serviceKey=${DserviceKey}&_type=json`;

// 항공운항상세정보

let airportKORs = [];
let airportIds = [];
let AirCompanyNms = [];
let AirCompanyIds = [];

let AirCompanyBox = document.querySelector('#AirCompanyN');
let DeAirportBox = document.querySelector('#SairportN');
let ArAirportBox = document.querySelector('#EairportN');
let SearchBtn = document.querySelector('#search--airplan');
let sDay = document.querySelector('#sDay');
let AirTable = document.querySelector('#AirTable > tbody');
let MoreBtn = document.querySelector('#MoreBtn');

// 날짜 초기값설정
function DateInit() {
    let Today = new Date(new Date().setMonth, new Date().getDate);
    let date = new Date().toISOString().slice(0, 10);
    let dateM = new Date().toISOString().slice(5, 7);
    let dateY = new Date().toISOString().slice(0, 4);
    // ex) 오늘 날짜 2024 01 이면 마이너스시 어떻게 값이 나오는지.. 수정필요
    let MinDate = dateM < 11 ? `${dateY}-0${dateM - 2}-01` : `${dateY}-${dateM - 2}-01`;

    sDay.setAttribute('max', date);
    // 뒤에나오는 값들이 일정하게 나오지않아 일시적으로 막아두기
    sDay.setAttribute("min", MinDate);
    sDay.value = date;
    sDay.textContent = Today;
}
DateInit();




let TableIndex = 0;
// TablePage 나중에 selet박스 벨류로 변경
let TablePage = 10;

DeAirportBox.addEventListener('change', CgBtnValue);
ArAirportBox.addEventListener('change', CgBtnValue);
function CgBtnValue() {
    data = getAirPortID();
    return data;
}

AirCompanyBox.addEventListener('change', function () {
    data = getAirCompanyID();
    return data;
});

SearchBtn.addEventListener('click', function (e) {
    e.preventDefault(); // 새로고침 막기
    // MoreBtn.style.display = 'flex'
    
    // 맵관련 부분 초기화
    DelMarkers();
    MakrerCts = [];
    MapLine.setMap(null);
    distanceOverlay.setMap(null)
    
    // 테이블 기본값 초기화
    AirTable.innerHTML = "";
    MoreBtn.style.display = 'none';
    TablePage = 10;
    TableIndex = 0;
    getInfo(); // 검색버튼 누를때마다 콜링

});


sDay.addEventListener('change', ParseDate);
// 날짜 API연동 시 날짜를 불러오는기준에 맞게 형식변화
function ParseDate() {
    let InputDate = new Date(sDay.value);
    let Today = new Date();
    let sCangeT = new Date(Today.setDate(Today.getDate() - 14));
    sCangeT = sCangeT.toISOString().slice(0, 10);

    if (sDay.value > sCangeT) {
        // input입력된 value가져와서 Date객체변환 후 14일 빼기
        let sCangeD = new Date(InputDate.setDate(InputDate.getDate() - 14));
        // 날짜 YYYY-MM-DD형식으로 변환
        sCangeD = sCangeD.toISOString().slice(0, 10);
        // split '-'기준으로 url에 맞는 형식변환
        sCangeD = sCangeD.split('-').join('');
        console.log(sCangeD);
        return sCangeD;
    } else {
        InputDate = InputDate.toISOString().slice(0, 10);
        InputDate = InputDate.split('-').join('');
        console.log(InputDate);
        return InputDate;
    }
}

MoreBtn.addEventListener('click', function () {
    TablePage = TablePage + 10;
    getInfo();
});

// 공항 출,도착 HTML selet박스 Setting
const SetDomAirP = async function () {
    const APresponse = await fetch(airportUrl);
    if (APresponse.status == 200) {
        let getAPort = await APresponse.json();
        let APortItems = getAPort.response.body.items.item;
        let index = 0;
        for (let APortItem of APortItems) {
            if (APortItem.airportNm !== '인천') {
                switch (APortItem.airportNm) {
                    case '김포':
                        DeAirportBox.innerHTML += `<option value="${APortItem.airportId}">서울/${APortItem.airportNm}</option>`;
                        ArAirportBox.innerHTML += `<option value="${APortItem.airportId}">서울/${APortItem.airportNm}</option>`;
                        break;
                    case '김해':
                        DeAirportBox.innerHTML += `<option value="${APortItem.airportId}">부산/${APortItem.airportNm}</option>`;
                        ArAirportBox.innerHTML += `<option value="${APortItem.airportId}">부산/${APortItem.airportNm}</option>`;
                        break;
                    case '포항':
                        DeAirportBox.innerHTML += `<option value="${APortItem.airportId}">${APortItem.airportNm}/포항경주</option>`;
                        ArAirportBox.innerHTML += `<option value="${APortItem.airportId}">${APortItem.airportNm}/포항경주</option>`;
                        break;
                    case '사천':
                        DeAirportBox.innerHTML += `<option value="${APortItem.airportId}">진주/${APortItem.airportNm}</option>`;
                        ArAirportBox.innerHTML += `<option value="${APortItem.airportId}">진주/${APortItem.airportNm}</option>`;
                        break;
                    default:
                        DeAirportBox.innerHTML += `<option value="${APortItem.airportId}">${APortItem.airportNm}</option>`;
                        ArAirportBox.innerHTML += `<option value="${APortItem.airportId}">${APortItem.airportNm}</option>`;
                }
                airportIds.push(APortItem.airportId);
                airportKORs.push(APortItem.airportNm);
            } else {
            }
            index++;
        }
        DeAirportBox[13].setAttribute('selected', true);
        ArAirportBox[6].setAttribute('selected', true);
    } else {
        throw new Error();
    }
};

// 항공사 HTML Setting
const SetDomAirL = async function () {
    const ALresponse = await fetch(AirCompanyUrl);
    if (ALresponse.status == 200) {
        let getALine = await ALresponse.json();
        let ALineItems = getALine.response.body.items.item;
        AirCompanyBox.innerHTML += `<option value="">전체</option>`;

        for (let ALineItem of ALineItems) {
            AirCompanyIds.push(ALineItem.airlineId);
            AirCompanyNms.push(ALineItem.airlineNm);
            AirCompanyBox.innerHTML += `<option value="${ALineItem.airlineId}">${ALineItem.airlineNm}</option>`;
        }

        AirCompanyBox[0].setAttribute('selected', true);

        // console.log(ALineItems)

    } else {
        throw new Error();
    }
};




// 공항Id값 구하기
const getAirPortID = async function () {
    DepCode = DeAirportBox.options[DeAirportBox.selectedIndex].value;
    ArrCode = ArAirportBox.options[ArAirportBox.selectedIndex].value;
    DepName = DeAirportBox.options[DeAirportBox.selectedIndex].textContent;
    ArrName = ArAirportBox.options[ArAirportBox.selectedIndex].textContent;
    if (DepCode !== "" && ArrCode !== "" && DepName !== "" && ArrName !== "") {
        return [DepCode, ArrCode, DepName, ArrName];
    } else {
        throw new Error();
    }
};


// 항공사Id값 구하기
const getAirCompanyID = async function () {
    const ALresponse = await fetch(AirCompanyUrl);
    let ALcode = AirCompanyBox.options[AirCompanyBox.selectedIndex].value;
    let ALname = AirCompanyBox.options[AirCompanyBox.selectedIndex].textContent;
    if (ALcode !== null || ALcode !== '' && ALname !== '') {

        return [ALcode, ALname];
    } else {
        throw new Error();
    }
};


const ParseInfo = async function (InfoUrl) {
    // console.log(InfoUrl)
    const Inforesponse = await fetch(InfoUrl);
    if (Inforesponse.status == 200) {
        let GetItems = await Inforesponse.json();
        let InfoItems = GetItems.response.body.items.item;
        // let InfoTimes = []
        // for(let InfoItem of InfoItems){
        //     InfoTimes.push(InfoItem.arrPlandTime)
        // console.log(InfoItem.arrPlandTime)
        // }
        // console.log(InfoTimes)
        return InfoItems;
    } else {
        throw new Error();
    }
};
const ParseInfoDetail = async function (urlData) {
    const Inforesponse = await fetch(urlData);
    console.log(Inforesponse.status);
    if (Inforesponse.status == 200) {
        let GetItems = await Inforesponse.json();
        let InfoItems = GetItems.data;
        //날짜값 필수
        return InfoItems;
    } else {
        throw new Error();
    }
};
// API 공항정보 최종조회 
// fetch부분 함수로 다시빼주기(간략화필요)
async function AirInfo(ApCode, ALiCode, sCangeD) {
    if (ALiCode[0] === "" || ALiCode[0] === null) {
        // const airInfoUrl = `https://apis.data.go.kr/1613000/DmstcFlightNvgInfoService/getFlightOpratInfoList?serviceKey=${DserviceKey}&pageNo=1&numOfRows=100&_type=json&depAirportId=${ApCode[0]}&arrAirportId=${ApCode[1]}&depPlandTime=${20230726}`;
        const airInfoUrl = `https://apis.data.go.kr/1613000/DmstcFlightNvgInfoService/getFlightOpratInfoList?serviceKey=${DserviceKey}&pageNo=1&numOfRows=300&_type=json&depAirportId=${ApCode[0]}&arrAirportId=${ApCode[1]}&depPlandTime=${sCangeD}`;
        let InfoItems = await ParseInfo(airInfoUrl);
        return InfoItems;
    } else {
        const airInfoUrl = `https://apis.data.go.kr/1613000/DmstcFlightNvgInfoService/getFlightOpratInfoList?serviceKey=${DserviceKey}&pageNo=1&numOfRows=300&_type=json&depAirportId=${ApCode[0]}&arrAirportId=${ApCode[1]}&depPlandTime=${sCangeD}&airlineId=${ALiCode[0]}`;
        let InfoItems = await ParseInfo(airInfoUrl);
        return InfoItems;
    }
}

async function AirDetail(ApCode, ALiCode, sCangeD) {
    if (ALiCode[0] === "" || ALiCode[0] === null) {
        // const AirDetailUrl = `https://api.odcloud.kr/api/FlightStatusListDTL/v1/getFlightStatusListDetail?page=1&perPage=100&returnType=JSON&cond%5BFLIGHT_DATE%3A%3AEQ%5D=${20230726}&cond%5BLINE%3A%3AEQ%5D=%EA%B5%AD%EB%82%B4&cond%5BBOARDING_KOR%3A%3AEQ%5D=${ApCode[2]}&cond%5BARRIVED_KOR%3A%3AEQ%5D=${ApCode[3]}&serviceKey=${DserviceKey}`;
        // const AirDetailUrl = `https://api.odcloud.kr/api/FlightStatusListDTL/v1/getFlightStatusListDetail?page=1&perPage=100&returnType=JSON&cond%5BFLIGHT_DATE%3A%3AEQ%5D=${sCangeD}&cond%5BLINE%3A%3AEQ%5D=%EA%B5%AD%EB%82%B4&cond%5BBOARDING_KOR%3A%3AEQ%5D=포항&cond%5BARRIVED_KOR%3A%3AEQ%5D=제주&serviceKey=${DserviceKey}`;
        const AirDetailUrl = `https://api.odcloud.kr/api/FlightStatusListDTL/v1/getFlightStatusListDetail?page=1&perPage=300&returnType=JSON&cond%5BFLIGHT_DATE%3A%3AEQ%5D=${sCangeD}&cond%5BLINE%3A%3AEQ%5D=%EA%B5%AD%EB%82%B4&cond%5BBOARDING_KOR%3A%3AEQ%5D=${ApCode[2]}&cond%5BARRIVED_KOR%3A%3AEQ%5D=${ApCode[3]}&serviceKey=${DserviceKey}`;
        let InfoItems = await ParseInfoDetail(AirDetailUrl);
        console.log(AirDetailUrl);
        return InfoItems;
    } else {
        const AirDetailUrl = `https://api.odcloud.kr/api/FlightStatusListDTL/v1/getFlightStatusListDetail?page=1&perPage=300&returnType=JSON&cond%5BFLIGHT_DATE%3A%3AEQ%5D=${sCangeD}&cond%5BLINE%3A%3AEQ%5D=%EA%B5%AD%EB%82%B4&cond%5BBOARDING_KOR%3A%3AEQ%5D=${ApCode[2]}&cond%5BARRIVED_KOR%3A%3AEQ%5D=${ApCode[3]}&cond%5BAIRLINE_KOREAN%3A%3AEQ%5D=${ALiCode[1]}&serviceKey=${DserviceKey}`;
        let InfoItems = await ParseInfoDetail(AirDetailUrl);
        console.log(AirDetailUrl);
        return InfoItems;
    }
}
// 기본정보 출발시간 뒤에4글자랑 상세정보 STD(예정시간) 값 비교필요

// 시간비교 함수 + 배열값넣어주기
const compareInfo = async function (ApCode, ALiCode, sCangeD) {
    let InfoItems = await AirInfo(ApCode, ALiCode, sCangeD);
    let Details = await AirDetail(ApCode, ALiCode, sCangeD);
    let ArrayInfo = [];
    let ArrayDetail = [];
    if (InfoItems !== undefined && Details !== []) {
        // InfoItems값이 정상적인 배열로 생성되었을경우
        if (InfoItems.length > 1) {
            for (let Info of InfoItems) {
                let getDepTime = Info.depPlandTime.toString();
                let InfoTime = getDepTime.slice(8);
                // console.log(InfoTime)
                // for (let Detail of Details) {
                //     let DetailTime = Detail.STD;
                //     if (InfoTime == DetailTime) {
                //         ArrayInfo.push(Info);
                //         ArrayDetail.push(Detail);
                //     }
                // }
                // Details 배열 확인구분 If문
                if (Details.length > 1) {
                    for (let Detail of Details) {
                        let DetailTime = Detail.STD;
                        if (InfoTime == DetailTime && Detail.GATE !== null && Detail.GATE !== '') {
                            ArrayInfo.push(Info);
                            ArrayDetail.push(Detail);
                        }
                    }
                } else {
                    let DetailTime = Details.STD;
                    if (InfoTime == DetailTime && Details.GATE !== null && Details.GATE !== '') {
                        ArrayInfo.push(Info);
                        ArrayDetail.push(Details);
                    }
                }
            }

            // 만약 InfoItems값이 하나여서 배열생성이 안되었을경우
        } else {
            let getDepTime = InfoItems.depPlandTime.toString();
            let InfoTime = getDepTime.slice(8);
            // console.log(InfoTime)

            // Details 배열 확인구분 If문
            if (Details.length > 1) {
                for (let Detail of Details) {
                    let DetailTime = Detail.STD;
                    if (InfoTime == DetailTime && Detail.GATE !== null && Detail.GATE !== '') {
                        ArrayInfo.push(InfoItems);
                        ArrayDetail.push(Detail);
                    }
                }
            } else {
                let DetailTime = Details.STD;
                if (InfoTime == DetailTime && Details.GATE !== null && Details.GATE !== '') {
                    ArrayInfo.push(InfoItems);
                    ArrayDetail.push(Details);
                }
            }
        }
        // console.log(InfoItems);
        // console.log(Details);
        return [ArrayInfo, ArrayDetail];
    } else {
        return [ArrayInfo, ArrayDetail];
    }
};

// Table안 td 생성 함수
const SetDomAirInfo = async function (Infos, Details, TablePage) {
    // 비교해서 리턴받은값 Info,Details 데이터 / TablePage = 10개씩나누어 보여주기위한 페이지세팅 추후 select박스로 값을 전달받을예정
    // console.log(Infos, Details);
    let ArrTime, DepTime, eTime, DepAP, ArrAp, AirL, AirPlaneN, GateN, FlightDate = '';
    if (Infos === "" || Details === []) {
        AirTable.innerHTML += `<div>예정된 항공편이 없습니다.</div>`;
    }
    else {
        for (TableIndex; TableIndex < TablePage; TableIndex++) {
            // console.log(Infos)
            ArrTime = Infos[TableIndex].arrPlandTime.toString();
            // console.log(ArrTime)
            ArrTime = ArrTime.slice(8);
            DepTime = Details[TableIndex].STD;
            eTime = Details[TableIndex].ETD;
            DepAP = Details[TableIndex].BOARDING_KOR;
            ArrAp = Details[TableIndex].ARRIVED_KOR;
            AirL = Details[TableIndex].AIRLINE_KOREAN;
            AirPlaneN = Details[TableIndex].AIR_FLN;
            GateN = Details[TableIndex].GATE;
            FlightDate = Details[TableIndex].FLIGHT_DATE;


            // 변형된 날짜를 원래대로 만들어주기위한 조건식 파트
            let Today = new Date();
            let sCangeT = new Date(Today.setDate(Today.getDate() - 14));
            sCangeT = sCangeT.toISOString().slice(0, 10);
            // sCangeT = sCangeT.split('-').join('');
            if (sDay.value > sCangeT) {
                GetRightDate = new Date(`${FlightDate.slice(0, 4)}`, `${FlightDate.slice(4, 6) - 1}`, `${FlightDate.slice(6, 8)}`);
                GetRightDate = new Date(GetRightDate.setDate(GetRightDate.getDate() + 15));
                GetRightDate = GetRightDate.toISOString().slice(0, 10);

                FlightDate = GetRightDate.split('-').join('');
            }


            // 테이플 생성 파트
            let SetDom = ``;
            if (GateN === null || GateN === "") {
                SetDom = ``;
            } else if (eTime === null || eTime === "") {
                SetDom = `
            <tr>
                <td>${FlightDate}</td>
                <td>${DepAP}</td>
                <td>${ArrAp}</td>
                <td>${AirL}</td>
                <td>${GateN}번</td>
                <td>${AirPlaneN}</td>
                <td class="DepTime">${DepTime}</td>
                <td></td>
                <td class="ArrTime">${ArrTime}</td>
                <td class="AirMarker">보기</td>
            </tr>
            `;
            } else {
                SetDom = `
            <tr>
                <td>${FlightDate}</td>
                <td>${DepAP}</td>
                <td>${ArrAp}</td>
                <td>${AirL}</td>
                <td>${GateN}번</td>
                <td>${AirPlaneN}</td>
                <td class="DepTime">${DepTime}</td>
                <td>${eTime}</td>
                <td class="ArrTime">${ArrTime}</td>
                <td class="AirMarker">보기</td>
            </tr>
            `;
            }
            AirTable.innerHTML += SetDom;
            // 더보기 버튼을 눌렀을때 마지막 목록을 조회하면 for문탈출+더보기버튼 숨기기
            if (TableIndex + 1 === Infos.length) {
                MoreBtn.style.display = 'none';
                break;
            } else {
                MoreBtn.style.display = 'flex';
                // 더보기버튼 반응형 css관리
                if (window.matchMedia("(min-width: 768px)").matches) {
                    MoreBtn.classList.remove('btn-info');
                    MoreBtn.classList.add('btn-outline-info');
                } else {
                    MoreBtn.classList.remove('btn-outline-info');
                    MoreBtn.classList.add('btn-info');
                }
            }
        }
    }

    // 보기 td를 버튼으로 만들어 사용 하기위한 event생성
    let AirMarkers = document.querySelectorAll('.AirMarker');
    for (let AirMarker of AirMarkers) {
        AirMarker.addEventListener('click', MapEvents);
    }

    return AirTable.innerHTML;
};



const getInfo = async function () {
    let sCangeD = ParseDate();
    let ALiCode = await getAirCompanyID();
    let ApCode = await getAirPortID();
    let Compare = await compareInfo(ApCode, ALiCode, sCangeD);
    let SetInfo = await SetDomAirInfo(Compare[0], Compare[1], TablePage);

    return SetInfo;
};

window.addEventListener('load', async function () {
    try {
        await SetDomAirP();
        await SetDomAirL();
        getInfo();
    } catch (error) {
        this.location.reload;
    }
});