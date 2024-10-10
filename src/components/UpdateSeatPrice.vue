<template>
  <div class="common-container">
    <BidStatus :bidStatus="bidStatus" />
    <div class="flexcolum-container">
    <br/>
      <div class="buttons-container" v-if="canUpdate">
        <button @click="handleCreateNewArray">좌석일괄 생성</button>
        <button @click="handleSubmit">작업내용 제출</button>
        <button @click="handleAddRow">새로운 행추가</button>

      </div>
      <div >
        <div ><h6> 좌석별 최소 입찰 가격 </h6></div>          
        <div v-if="message" class="message-box">{{ message }}</div>
        <div v-if="showPrompt" class="input-prompt">
          <div class="input-container">
            <label>
              생성할 좌석수:
              <input type="number" v-model.number="seatCount" max="999" />
            </label>
            <label>
              시작 번호:
              <input type="number" v-model.number="startSeatNumber" max="999" />
            </label>
            <label>
              기본 가격:
              <input type="number" v-model.number="basePrice" max="99999" />
            </label>
            <div >
              <button @click="handleSeatCountSubmit" class="small-button">생성</button>
              <button @click="hidePrompt" class="small-button">취소</button>
            </div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>좌석 번호</th>
              <th>열 번호</th>
              <th>컬럼 번호</th>
              <th>최소 입찰가</th>
              <th></th>
            </tr>
          </thead>
          <tbody class="input-table">
            <tr v-for="(seat, index) in seatArray" :key="index">
              <td>
                <input
                  type="text"
                  v-model="seat.seat_no"
                  @input="handleInputChange(index, 'seat_no', seat.seat_no)"
                  max="999"
                />
              </td>
              <td>
                <input
                  type="text"
                  v-model="seat.row_no"
                  @input="handleInputChange(index, 'row_no', seat.row_no)"
                  max="999"
                />
              </td>
              <td>
                <input
                  type="text"
                  v-model="seat.col_no"
                  @input="handleInputChange(index, 'col_no', seat.col_no)"
                  max="999"
                />
              </td>
              <td>
                <input
                  type="number"
                  v-model.number="seat.seat_price"
                  @input="handleInputChange(index, 'seat_price', seat.seat_price)"
                  max="99999"
                />
              </td>
              <td v-if="canUpdate">
                <button @click="handleRemoveRow(index)" class="small-button">삭제</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter} from 'vue-router';
import { url, API, messageCommon } from '../utils/messagesAPIs';
import BidStatus from './BidStatus.vue';

export default {
  components: {
    BidStatus
  },
  setup() {
    const router = useRouter();
    const sessionUserId = ref('');
    const matchNumber = ref('0');
    const bidStatus = ref({});
    const seatArray = ref([]);
    const seatArrayToDelete = ref([]);  // 삭제할 좌석을 저장할 배열
    const originalSeats = ref([]);
    const seatCount = ref(0);
    const startSeatNumber = ref(1);
    const basePrice = ref(1);
    const showPrompt = ref(false);
    const canUpdate = ref(false);
    const message = ref('');

    const fetchSessionUserId = async () => {
      try {
        const response = await axios.get(API.GET_SESSION_USERID, { withCredentials: true });
        if (response.status === 200) {
          sessionUserId.value = response.data.userId;
        }
      } catch (error) {
        alert('로그인이 필요합니다.');
        // router.push(url.adminlogin);
      }
    };
    const fetchBidStatus = async (sessionMatchNumber) => {
        try {
          const response = await axios.get(API.GET_BIDSTATUS, { params: { matchNumber: sessionMatchNumber } }, { withCredentials: true });
          if (response.status === 200 && response.data) {
            bidStatus.value = response.data;
            if (bidStatus.value.bidStatusCode == 'N') {
              {canUpdate.value = true}
            }
          }
        } catch (error) {
          handleError(error);
        }
      };

    const fetchSeats = async (sessionMatchNumber) => {
      try {
        const response = await axios.get(API.GET_SEATPRICE, { params: { matchNumber: sessionMatchNumber } });
        seatArray.value = response.data.map(seat => ({
          ...seat,
          matchNumber: sessionMatchNumber, // matchNumber를 로컬세션 매치 번호로 설정
        }));
        originalSeats.value = JSON.parse(JSON.stringify(response.data));
      } catch (error) {
        handleError(error);
      }
    };

    const handleInputChange = (index, field, value) => {
      seatArray.value[index][field] = value;
    };

    const handleRemoveRow = async (index) => {
      const confirmDelete = window.confirm('정말로 이 좌석을 삭제하시겠습니까?');
      
      if (confirmDelete) {
        // 삭제할 좌석을 seatArrayToDelete에 저장
        seatArrayToDelete.value.push(seatArray.value[index].seat_no);
        handleDeleteSeats();
      }
    };

    const handleAddRow = () => {
      const newSeat = {
        row_no: '',
        col_no: '',
        seat_no: '',
        seat_price: '',
        matchNumber: '',
      };
      seatArray.value = [...seatArray.value, newSeat];
    };

    const handleDeleteSeats = async () => {
      if (seatArrayToDelete.value.length === 0) {
        return;  // 삭제할 좌석이 없으면 아무 동작도 하지 않음
      }

      try {
        const response = await axios.post(API.DELETE_SEATPRICEARRAY, {
          seatNoArray: seatArrayToDelete.value,  // 삭제할 좌석 배열
          match_no: matchNumber.value      // 현재 match_no
        });

        if (response.status === 200) {
          alert('좌석이 성공적으로 삭제되었습니다.');
          // 삭제 후 배열 비우기
          seatArray.value = seatArray.value.filter(seat => !seatArrayToDelete.value.includes(seat.seat_no));
          seatArrayToDelete.value = [];
          message.value = response.data.message;
        } else {
          alert('좌석 삭제에 실패했습니다.');
        }
      } catch (error) {
        alert('좌석 삭제 중 오류가 발생했습니다.');
      }
    };

    const handleSubmit = async () => {
      const updatedSeatArray = seatArray.value.filter(seat => {
        const originalSeat = originalSeats.value.find(s => s.seat_no === seat.seat_no);
        return !originalSeat || originalSeat.seat_price !== seat.seat_price || 
              originalSeat.row_no !== seat.row_no || originalSeat.col_no !== seat.col_no;
      });

      if (updatedSeatArray.length === 0) {
        alert('변경된 내용이 없습니다.');
        return;
      }

      const userConfirmed = confirm(`총 ${updatedSeatArray.length}개가 처리됩니다. 계속하시겠습니까?`);

      if (!userConfirmed) {
        return;
      }

      // 2. 좌석 업데이트 API 호출
      if (updatedSeatArray.length > 0) {
        try {
          const response = await axios.post(API.UPDATE_SEATPRICEARRAY, {seatPriceArray :updatedSeatArray}, {

          });

          if (response.status === 200) {
            alert('좌석이 성공적으로 업데이트되었습니다.');
            message.value = response.data.message;
          } 
        } catch (error) {
          alert('좌석 업데이트 중 오류가 발생했습니다.');
        }
      }
    };
    const handleError = (error) => {
      if (error.response) {
        message.value = error.response.data;
      } else if (error.request) {
        message.value = messageCommon.ERR_NETWORK;
      } else {
        message.value = messageCommon.ERR_ETC;
      }
    }

    const handleCreateNewArray = () => {

      if (seatArray.value.length === 0) {
        showPrompt.value = true;
        return; // 배열이 비어 있으면 함수 종료
      } else {
        const userConfirmed = confirm(`현재 행이 전부 삭제된 후 입력합니다. 계속하시겠습니까?`);
          if (userConfirmed) {
          // 현재 seatArray를 seatArrayToDelete에 추가
          seatArrayToDelete.value = seatArray.value.map(seat => seat.seat_no);
          seatArray.value = [];
          handleDeleteSeats();
          showPrompt.value = true;
        } else {
          return;
        }
      }
    };

    const hidePrompt = () => {
      showPrompt.value = false;
    };

    const handleSeatCountSubmit = () => {
      if (seatCount.value <= 0 || startSeatNumber.value < 1) {
        alert('좌석 개수와 시작 번호는 1 이상의 숫자여야 합니다.');
        return;
      }
      // 새로운 좌석 배열 생성
      const newSeats = Array.from({ length: seatCount.value }, (_, index) => ({
        row_no: '',
        col_no: '',
        seat_no: String(startSeatNumber.value + index),
        seat_price: basePrice.value,
        matchNumber: matchNumber.value,
      }));

      // seatArray 초기화 후 새로 생성된 좌석 추가
      seatArray.value = [...newSeats];
      showPrompt.value = false;
      seatCount.value = 0;
      startSeatNumber.value = 1;
    };

    onMounted(async () => {
        const sessionMatchNumber = sessionStorage.getItem('matchNumber');

        if (sessionMatchNumber) {
          try {
            matchNumber.value = sessionMatchNumber;
            await fetchSessionUserId();  // 비동기 함수 처리
            await fetchBidStatus(sessionMatchNumber); 
            await fetchSeats(sessionMatchNumber);
          } catch (error) {
            console.error('비동기 함수 호출 중 오류 발생:', error);
            alert('오류가 발생했습니다. 다시 시도해주세요.');
          }
        } else {
          alert('경기를 먼저 선택해주세요.');
          router.push(url.selectmatch);  // router.push가 잘 동작하는지 확인
        }
      });
    return {
      sessionUserId,
      seatArray,
      matchNumber,
      bidStatus,
      originalSeats,
      message,
      seatCount,
      startSeatNumber,
      basePrice,
      showPrompt,
      canUpdate,
      handleInputChange,
      handleRemoveRow,
      handleAddRow,
      handleSubmit,
      handleCreateNewArray,
      hidePrompt,
      handleSeatCountSubmit,
    };
  },
};
</script>

<style scoped>
/* 스타일 정의 */

</style>
