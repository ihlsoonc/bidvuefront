<template>
  <div class="common-container">
    <!-- 입찰 상태 표시 -->
    <BidStatus :bidStatus="bidStatus" />
    
    <div class="seat-list">
      <h5 style="text-align: center;">입찰 및 낙찰 현황</h5>

      <!-- 입찰 좌석이 없는 경우 -->
      <div v-if="seatBidArray.length === 0" class="empty-seats">
        입찰 좌석이 없습니다.
      </div>

      <!-- 입찰 좌석이 있는 경우 -->
      <div v-else >
        <!-- <div v-else class="seat-input-grid"> -->
        <ul v-if="seatBidArray && seatBidArray.length > 0">
          <li v-for="(seat, index) in seatBidArray" :key="index" class="seat-box">
            <div>좌석 번호: {{ seat.seat_no }} ({{ seat.row_no }} 열 {{ seat.col_no }}번) <span class="bold-text">{{ seat.bidWonStatus }}</span></div>
            <div>
              입찰 금액: {{ seat.bid_amount.toLocaleString() }}원 {{ formatTimeToLocal(seat.bid_at) }}
            </div>
            <div>
              현재 최고가: {{(seat.highest_bid_amount || 0).toLocaleString() }}원 결제현황 :{{ seat.paidStatus }} {{ seat.bid_pay_method }}
            </div>
            <!-- 이력 버튼 -->
            <div v-if="seat.bidHistory && seat.historyButtonEnabled">
              <button
                @click="showHistory(index)"
                :class="{ active: selectedHistoryButton === index}"
                class="medium-button"
              >
                이력보기 {{ seat.bidHistory.length }}건
              </button>
            </div>
            <!-- 아코디언: selectedHistoryButton이 현재 인덱스와 같을 때만 열기 -->
            <div v-if=seat.historyShow class="accordion-content">
              <h6>입찰 이력 : 입찰액, 입찰 시각</h6>
              <ul >
                <li v-for="(history, hIndex) in seat.bidHistory" :key="hIndex">
                  <div>{{ history.bid_amount.toLocaleString() }}원  {{ formatTimeToLocal(history.bid_at) }}</div>
                </li>
              </ul>
            </div> <!-- 아코디언 끝 -->
          </li>
        </ul>
      </div>
    </div>
    <!-- 결제 및 총 입찰 금액 -->
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>입찰가격 합계: {{ totalBidAmount.toLocaleString() }}원</div>
      <br/>
      <div>낙찰가격 합계:{{ totalWinAmount.toLocaleString() }}원 {{ totalWinCount }}건</div>
      <br/>
      <button
        @click="handlePaySubmit"
        :disabled="isApproved"
        class="medium-button"
      >
        결제 진행
      </button>
      <button
        @click="handleSelectVenue"
        class="medium-button"
      >
        경기 다시 선택
      </button>
    </div>

    <!-- 새로운 입찰 입력 섹션 -->
    <div class="content-container" v-if="!isClosedBid">
      <h5 style="text-align: center;">새로운 입찰 입력</h5>

      <!-- SeatMap 컴포넌트 -->
      <SeatMap :selectedSeats="selectedSeats" @seatClick="handleSeatClick" :disabled="isClosedBid" />

      <!-- 선택된 좌석 정보와 입찰 금액 -->
      <div class="selected-seats">
        <SelectedSeatsDetails
          :selectedSeats="selectedSeats"
          :bidAmounts="bidAmounts"
          @bidAmountChange="handleBidAmountChange"
          :isClosedBid="isClosedBid"
          :isUser="isUser"
        />

        <!-- 최저 입찰 금액 합계와 현재 입찰 금액 -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span class="spaced-span">최저 입찰 금액 합계: {{ minBidAmount }}원</span>
            <span>현재 입찰금액: {{ bidTotal }}원</span>
          </div>
          <div class="buttons-container" v-if="selectedSeats.length > 0 && !isClosedBid">
            <button
              @click="handleBidSubmit"
              class="medium-button"
            >
              입찰 제출
            </button>
          </div>
        </div>
      </div>
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import BidStatus from './BidStatus.vue';
import SeatMap from './SeatMap.vue';
import SelectedSeatsDetails from './SelectedSeatsDetails.vue';
import { fetchSeatData } from '../utils/fetchSeatData';
import { formatTimeToLocal } from '../utils/commonFunction';
import { url, API, messageCommon} from '../utils/messagesAPIs.js';

const MAX_SELECTION = 5;

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
    const isClosedBid = ref(false);
    const selectedSeats = ref([]);
    const selectedHistoryButton =ref(-1);
    const clickCount = ref(0);
    const minBidAmount = ref(0);
    const bidAmounts = ref({});
    const bidTotal = ref(0);
    const message = ref('');
    const seatBidArray = ref([]);
    const isApproved = ref(false);
    const isUser = ref(true);
    const paymentData = ref({});
    const totalBidAmount = ref(0);
    const totalWinAmount = ref(0);
    const totalWinCount = ref(0);

    const fetchBidStatus = async (sessionMatchNumber) => {
      try {

        const response = await axios.get(API.GET_BIDSTATUS, {
          params: { matchNumber: sessionMatchNumber },
          withCredentials: true
        });
        bidStatus.value = response.data;
        if (response.data.bidStatusCode !== 'O') {
          isClosedBid.value = true;
        }
      } catch (error) {
        handleError(error);
      }
    };

    const fetchMyLast = async () => {
    try {
      const response = await axios.get(API.GET_MY_LASTBIDS, {
        params: { userId: sessionUserId.value, matchNumber: matchNumber.value }
      });

      // 낙찰된 총 금액과 낙찰된 항목의 수를 계산할 변수

      seatBidArray.value = response.data.map(seat => {
        // 낙찰 여부에 따라 total_win_amount와 total_win_count를 업데이트
        // if (bidStatus.value.bid_open_status === 'F' && seat.bid_won === 'Y') {
        //   totalWinAmount.value += seat.bid_amount || 0;
        //   totalWinCount.value++;
        // }
          totalWinAmount.value += seat.bid_amount || 0;
          totalWinCount.value++;
        return {
          ...seat,
          bidWonStatus: bidStatus.value.bid_open_status === 'F' 
                    ? (seat.bid_won === 'Y' ? '낙찰' : '유찰') 
                    : ' ',
          paidStatus: seat.bid_paid === 'Y' ? '결제완료' : '미결제',
          historyButtonEnabled: false,
          historyShow: false
        };
      });

      // 총 입찰 금액을 계산
      totalBidAmount.value = seatBidArray.value.reduce((sum, seat) => sum + (seat.bid_amount || 0), 0);

      } catch (error) {
        handleError(error);
      }
   };

    const fetchMyBids = async () => {
      try {
        const response = await axios.get(API.GET_MY_BIDS, {
          params: { userId: sessionUserId.value, matchNumber: matchNumber.value }
        });

        // 서버에서 받아온 데이터를 seatBidArray에 매핑 또는 업데이트
        response.data.forEach(seat => {

          // seat_no가 동일한 항목을 찾음 (string, number 비교 문제 해결을 위해 String 변환)
          const existingSeat = seatBidArray.value.find(bid => String(bid.seat_no) === String(seat.seat_no));
          
          // bidHistory가 없다면 bid 정보를 기반으로 새로 생성
          const bidHistory = seat.bidHistory || [{
            bid_amount: seat.bid_amount,
            bid_at: seat.bid_at
          }];

          if (existingSeat) {

            // 기존 항목에 데이터를 추가 (bidHistory 등 필요에 따라 추가)
            existingSeat.bidHistory = existingSeat.bidHistory || []; // null 방지, 빈 배열로 초기화
            existingSeat.bidHistory = [...existingSeat.bidHistory, ...bidHistory]; // 새 이력 추가
            
            existingSeat.historyButtonEnabled = existingSeat.bidHistory.length > 1;
            existingSeat.historyShow = false;

          } else {
            console.log("좌석번호가 match되지 않는 이력이 있습니다.:", seat); // 새로 추가할 좌석 데이터를 출력
          }
        });
      } catch (error) {
        console.error("에러 발생:", error); // 에러가 발생한 경우 로그 출력
        handleError(error);
      }
    };

    const showHistory = (index) => {
      // selectedHistoryButton 값을 사용하여 입찰 이력을 다시 열거나 닫음
      const seat = seatBidArray.value[index];
      if (selectedHistoryButton.value === index) {
        // 이미 열려있으면 다시 닫음 (undo 개념)
        seat.historyShow = false;
        selectedHistoryButton.value = -1;  // 닫음
      } else {
        // 이력을 다시 열기 (redo 개념)
        selectedHistoryButton.value = index;  // 열기
        seat.historyShow = true;
      }

    };

    const handleSeatClick = (index) => {
      selectedSeats.value = selectedSeats.value.some(seat => seat.uniqueSeatId === index)
        ? selectedSeats.value.filter(seat => seat.uniqueSeatId !== index)
        : [...selectedSeats.value, { seat_no: index, uniqueSeatId: index }];

      if (selectedSeats.value.length > MAX_SELECTION) {
        alert(`최대 ${MAX_SELECTION}개의 좌석만 선택할 수 있습니다.`);
        selectedSeats.value = selectedSeats.value.slice(0, MAX_SELECTION);
      }
      clickCount.value += 1;
    };

    const handleBidSubmit = async () => {
        const invalidSeats = selectedSeats.value.filter(seat => {
          const minBidPrice = seat.current_bid_amount > 0 ? seat.current_bid_amount : seat.seat_price;
          const currentBid = bidAmounts.value[seat.uniqueSeatId] || 0;
          return currentBid <= minBidPrice;
        });

        if (invalidSeats.length > 0) {
          const seatNumbers = invalidSeats.map(seat => seat.seat_no).join(', ');
          alert(`좌석 ${seatNumbers}의 입찰 금액이 현재 입찰 최저가보다 작습니다.`);
          return;
        }
  
        const confirmMessage = `입찰 금액 ${bidTotal.value}원으로 등록됩니다. 진행하시겠습니까?`;
        const isConfirmed = window.confirm(confirmMessage);
  
        if (!isConfirmed) return;

        try {
          const response = await axios.post(
                          API.SUBMIT_BID, 
                          {
                            userId: sessionUserId.value,
                            matchNumber: matchNumber.value,
                            bidArray: selectedSeats.value.map(seat => ({
                              matchNumber: seat.match_no,
                              seatNo: seat.seat_no,
                              bidAmount: bidAmounts.value[seat.uniqueSeatId] || 0
                            }))
                          },
                          {
                            withCredentials: true
                          }
                        );

          const fetchedData = response.data; // response에서 데이터 추출
          const fetchedDataMap = fetchedData.reduce((acc, data) => {
            acc[data.seat_no] = data;  // seat_no를 키로 맵을 생성
            return acc;
            }, {});

          selectedSeats.value = selectedSeats.value.map(seat => {
            const result = fetchedDataMap[seat.seat_no];
            return {
              ...seat,
              submitResult: result?.message || 'x'  // result가 없을 경우 'x'로 기본값 설정
            };
          });

          if (response.status === 200) {  // 응답 상태가 200일 경우
            message.value = response.data.message;
            fetchMyLast();  // 나의 입찰 데이터 다시 불러오기
            fetchMyBids();  // 나의 입찰 데이터 다시 불러오기
          }
        } catch (error) {
          handleError(error);
        }
      };

    const handleBidAmountChange = (value, seat) => {
      bidAmounts.value = {
        ...bidAmounts.value,
        [seat.uniqueSeatId]: parseFloat(value) || 0
      };
    };

    // 객체를 쿼리 스트링으로 변환하는 함수
    const objectToQueryString = (obj) => {
      return Object.keys(obj)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
        .join('&');
    };

    const handlePaySubmit = () => {
      localStorage.setItem('userId', sessionUserId.value);
      paymentData.value = {
        ...paymentData.value,
        userId: sessionUserId.value,
        price: totalWinAmount.value,
        goodName: `좌석입찰 총 ${totalWinCount.value} 건`
      };

      // 결제 데이터를 쿼리 스트링으로 변환
      const queryString = objectToQueryString(paymentData.value);

      // 리디렉션할 URL 생성
      const redirectUrl = `${API.PG_START}?${queryString}`;

      // 리디렉션 실행
     window.location.href = redirectUrl;
    }

    const handleError = (error) => {
      if (error.response) {
        message.value = error.response.data;
      } else if (error.request) {
        message.value = messageCommon.ERR_NETWORK;
      } else {
        message.value = messageCommon.ERR_ETC;
      }
    }

    watch([selectedSeats, bidAmounts], ([newSelectedSeats, newBidAmounts]) => {
    if (newSelectedSeats && newBidAmounts) {
      const minBidAmountCalc = newSelectedSeats.reduce((sum, seat) => {
        const chosenAmount = seat.current_bid_amount > 0 ? seat.current_bid_amount : seat.seat_price;
        return sum + (chosenAmount || 0);
      }, 0);
      minBidAmount.value = minBidAmountCalc;

      const bidTotalCalc = newSelectedSeats.reduce((sum, seat) => {
        return sum + (newBidAmounts[seat.uniqueSeatId] || 0);
      }, 0);
      bidTotal.value = bidTotalCalc;
    }
    }, { deep: true });

    watch([clickCount], () => {
    if (selectedSeats.value.length > 0) {
      fetchSeatData(matchNumber.value, selectedSeats.value, (data) => {
        selectedSeats.value = data;
      }, (msg) => {
        message.value = msg;
      });
    }
    }, { deep: true });

    const handleSelectVenue = () =>{
      router.push(url.selectvenue);
    }

    const fetchSessionUserId = async () => {
      try {
        const response = await axios.get(API.GET_SESSION_USERID, { withCredentials: true });
        sessionUserId.value = response.data.userId;
        await fetchBidStatus(matchNumber.value);
        await fetchMyLast();
        await fetchMyBids();
      } catch (error) {
        alert('로그인이 필요합니다.');
      }
    };

    onMounted( async () => {
      const sessionMatchNumber = sessionStorage.getItem('matchNumber');
      if (sessionMatchNumber) {
        matchNumber.value = sessionMatchNumber;

      } else {
        alert('경기를 먼저 선택해주세요.');
        router.push(url.selectmatchuser);
      }
      const queryString = window.location.search;
      const params = new URLSearchParams(queryString);
      
      // 특정 파라미터 값 가져오기
      if (params.has('userId')) {
        sessionUserId.value = params.get('userId');
        alert("쿼리 ID is: " + sessionUserId.value);
      } else {
        await fetchSessionUserId();
        alert("세션 ID is: " + sessionUserId.value);
      }
      // const userType = params.get('userType');


    });

    return {
      sessionUserId,
      matchNumber,
      bidStatus,
      selectedSeats,
      minBidAmount,
      bidAmounts,
      bidTotal,
      seatBidArray,
      totalBidAmount,
      totalWinAmount,
      totalWinCount,
      isClosedBid,
      isApproved,
      isUser,
      formatTimeToLocal,
      handleSeatClick,
      handleBidSubmit,
      showHistory,
      handleBidAmountChange,
      handlePaySubmit,
      handleSelectVenue,
      message
    };
  }
};
</script>

<style scoped>
.empty-seats {
  color: red;
}

ul {
  list-style-type: none;
  padding: 0;
}

.seat-box {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: space-between;
  border: 1px solid #ddd;
  padding: 2px;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.accordion-content {
  background-color: #f1f1f1;
  padding: 10px;
  border: 1px solid #ddd;
  margin-top: 5px;
  border-radius: 5px;
  display: block;
  transition: max-height 0.2s ease-out;
}

.bold-text {
  font-weight: bold;
}

/* 작은 화면을 위한 스타일 */
@media (max-width: 500px) {
  .submit-button {
    font-size: 14px;
    padding: 8px;
  }

  h5 {
    font-size: 18px;
    text-align: center;
  }
}
</style>

