<template>
    <div class="common-container">
      <div class="columflex-container">
        <BidStatus :bidStatus="bidStatus" />
        <div v-if="message" class="message-box">{{ message }}</div>
        <br/>
        <div class="buttons-container">
          <label class="small-radio-button">
            <input type="radio" name="action" @change="handleAllClick" />
            전체좌석 보기
          </label>
          <label class="small-radio-button">
            <input type="radio" name="action" @change="handleBiddedSeat" />
            입찰좌석 보기
          </label>

        </div>
      <!-- SeatMap 컴포넌트 -->
      <SeatMap
        :selectedSeats="selectedSeats"
        @seatClick="handleSeatClick"
        :disabled="isClosedBid"
        :seatBidArray="allSeatBidArray"
      />
      <br/>
      <button
        @click="handleRefresh"
      >
        데이터 다시 불러오기
      </button>
      </div>
        <div class="columflex-container">
          <br/>
          <div class="buttons-container" v-if = "canAwardBid">
            <button

              @click="handleAwardBid"
            >
              낙찰 진행
            </button>
          </div>
          <br />
          <div v-if="countSelectedSeats > 0" class="selected-seat-headers">
            <span class="spaced-span">선택된 좌석수&nbsp;: {{ countSelectedSeats }}개&nbsp;</span>
            <span class="spaced-span">입찰 좌석수&nbsp;: {{ countbiddedSeats }}개&nbsp;</span>
            <span class="spaced-span">입찰금액 합계: {{ bidTotal }}원</span>&nbsp;
            <span>합계 : {{ minBidAmount }}원</span>
          </div>
          <div v-if="countSelectedSeats > 0">
            <!-- isUser인 경우에만 입찰금액입력란과 제출결과 필드 Show -->
            <!-- isUser인 isClosedBid인 경우에는 입찰 제출 버튼 diable-->
            <SelectedSeatsDetails
              :selectedSeats="selectedSeats"
              :bidAmounts="[]"
              @bidAmountChange="handleBidAmountChange"
              :isUser=false                      
              :isClosedBid=false      
            />
          </div>
        </div>
    </div>
  </template>
  
  <script>
  import { onMounted, ref, watch } from 'vue';
  import axios from 'axios';
  import { useRouter} from 'vue-router';
  import BidStatus from './BidStatus.vue';
  import SeatMap from './SeatMap.vue';
  import SelectedSeatsDetails from './SelectedSeatsDetails.vue';
  import { url, API, messageCommon } from '../utils/messagesAPIs.js';
  
  // 상수 정의
  // const MAX_SELECTION = 100;
  
  export default {
    components: {
      BidStatus,
      SeatMap,
      SelectedSeatsDetails
    },
    setup() {
      const router = useRouter();
      const sessionUserId = ref('');
      const matchNumber = ref(0);
      const bidStatus = ref({});
      const canAwardBid = ref(false);
      const selectedSeats = ref([]);
      const allSeatBidArray = ref([]);
      const countSelectedSeats = ref(0);
      const clickCount = ref(0);
      const countbiddedSeats = ref(0);
      const minBidAmount = ref(0);
      const bidTotal = ref(0);
      const message = ref('');
      
      // 컴포넌트가 처음 렌더링될 때 호출되는 useEffect
      onMounted(async () => {
        const sessionMatchNumber = sessionStorage.getItem('matchNumber');

        if (sessionMatchNumber) {
          try {
            matchNumber.value = sessionMatchNumber;
            await fetchSessionUserId();  // 비동기 함수 처리
            await fetchBidStatus(sessionMatchNumber);      // 비동기 함수 처리
            await fetchAllBids();
          } catch (error) {
            console.error('비동기 함수 호출 중 오류 발생:', error);
            alert('오류가 발생했습니다. 다시 시도해주세요.');
          }
        } else {
          alert('경기를 먼저 선택해주세요.');
          router.push(url.selectmatch);  // router.push가 잘 동작하는지 확인
        }
      });



      // 선택된 좌석이 변경될 때마다 합계 금액 계산
      watch(selectedSeats, () => {
        calculateBiddedSeats();
        const minBidAmountCalc = selectedSeats.value.reduce((sum, seat) => {
        const chosenAmount = seat.current_bid_amount > 0 ? seat.current_bid_amount : seat.seat_price;
          return sum + (chosenAmount || 0);
        }, 0);
        minBidAmount.value = minBidAmountCalc;
  
        const bidtotal = selectedSeats.value.reduce((sum, seat) => {
          return sum + (seat.current_bid_amount || 0);
        }, 0);
        bidTotal.value = bidtotal;
      }, { deep: true });
  
      const handleRefresh = async () => {
        await fetchAllBids();
      };

      // 좌석 클릭 처리 함수
      const handleSeatClick = (index) => {
        const MAX_SELECTION = 100;
        let updatedSeats;

        if (selectedSeats.value.some(seat => seat.uniqueSeatId === index)) {
          // 좌석이 이미 선택된 경우
          updatedSeats = selectedSeats.value.filter(seat => seat.uniqueSeatId !== index);
        } else {
          // 좌석이 선택되지 않은 경우
          if (selectedSeats.value.length >= MAX_SELECTION) {
            alert(`최대 ${MAX_SELECTION}개의 좌석만 선택할 수 있습니다.`);
            return;
          }
          updatedSeats = [...selectedSeats.value, { seat_no: index, uniqueSeatId: index }];
          clickCount.value += 1;
        }

        selectedSeats.value = updatedSeats;
        countSelectedSeats.value = updatedSeats.length;

      };
  
      // 낙찰을 진행하는 함수
      const handleAwardBid = async () => {
        if (!canAwardBid.value) {
          alert("낙찰을 진행할 수 없습니다.");
          return;
        }
  
        const isConfirmed = window.confirm('낙찰을 진행하겠습니까?');
        if (!isConfirmed) return;
  
        try {
          const response = await axios.post(API.AWARD_BID, {
            matchNumber: matchNumber.value
          });
          if (response.status === 200) {
            alert('성공적으로 낙찰 처리가 되었습니다.');
            message.value = response.data.message;
            fetchBidStatus(matchNumber.value)
            canAwardBid.value = false;
          }
        } catch (error) {
          handleError(error);
        }
      };
  
      // 전체 좌석 선택 시 처리 함수
      const handleAllClick = async () => {
        countbiddedSeats.value = 0;
        message.value = '';
        minBidAmount.value = 0;
        bidTotal.value = 0;
        clickCount.value = 0;
        selectedSeats.value = allSeatBidArray.value;
        countSelectedSeats.value = selectedSeats.value.length;
      };
  
      // 좌석 선택 화면으로 이동 함수
      const handleBiddedSeat = () => {
        selectedSeats.value = allSeatBidArray.value.filter(seat => seat.total_bidders > 0);
        countSelectedSeats.value = selectedSeats.value.length;
        countbiddedSeats.value = selectedSeats.value.length;
        message.value = '';
        minBidAmount.value = 0;
        bidTotal.value = 0;
        clickCount.value = 0;
      };
  
      // 입찰 금액 변경 함수
      const handleBidAmountChange = () => {
        return;
      };
 
      // 사용자 ID를 가져오는 함수
      const fetchSessionUserId = async () => {
        try {
          const response = await axios.get(API.GET_SESSION_USERID, { withCredentials: true });
          if (response.status === 200) {
            sessionUserId.value = response.data.userId;
          }
        } catch (error) {
          alert('로그인이 필요합니다.');
          router.push(url.adminlogin);
        }
      };
  
      // 입찰 상태를 가져오는 함수
      const fetchBidStatus = async (sessionMatchNumber) => {
        try {
          const response = await axios.get(API.GET_BIDSTATUS, { params: { matchNumber: sessionMatchNumber } }, { withCredentials: true });
          if (response.status === 200 && response.data) {
            bidStatus.value = response.data;
            if (bidStatus.value.bidStatusCode == 'C')
                {canAwardBid.value = true}
          }
        } catch (error) {
          handleError(error);
        }
      };
      const fetchAllBids = async () => {
      try {
        const response = await axios.get(API.GET_ALL_BIDS, {
          params: { userId: sessionUserId.value, matchNumber: matchNumber.value }
        });

        // 서버에서 좌석별 입찰자 수와 최고 입찰 금액을 포함하여 데이터를 가져옴
        allSeatBidArray.value = response.data.map(seat => {
          return {
            ...seat,
            uniqueSeatId :seat.seat_no,
            seat_no:seat.seat_no,
            highest_bid_amount: seat.current_bid_amount || 0, // 최고 입찰 금액 추가
            bid_count: seat.total_bidders || 0, // 입찰자 수 추가
          };
        });
        // total_bidders가 0보다 큰 좌석을 selectedSeats에 추가
        selectedSeats.value = allSeatBidArray.value.filter(seat => seat.total_bidders > 0);
        countSelectedSeats.value = selectedSeats.value.length;
        } catch (error) {
          handleError(error);
        }
    };

  
      // 총 입찰 좌석 수 계산
      const calculateBiddedSeats = () => {
        const count = selectedSeats.value.filter(seat => seat.total_bidders > 0).length;
        countbiddedSeats.value = count;
      };
  
      const handleError = (error) => {
      if (error.response) {
        message.value = error.response.data;
      } else if (error.request) {
        message.value = messageCommon.ERR_NETWORK;
      } else {
        message.value = messageCommon.ERR_ETC;
      }
  };
  
  
      return {
        sessionUserId,
        matchNumber,
        bidStatus,
        canAwardBid,
        allSeatBidArray,
        selectedSeats,
        countSelectedSeats,
        clickCount,
        countbiddedSeats,
        minBidAmount,
        bidTotal,
        message,
        handleSeatClick,
        handleAwardBid,
        handleAllClick,
        handleRefresh,
        handleBiddedSeat,
        handleBidAmountChange,
        fetchSessionUserId,
        fetchBidStatus,
        calculateBiddedSeats,
        handleError
      };
    }
  };
  </script>
  
  <style scoped>
  /* 스타일을 여기에 추가하세요 */
  </style>
  