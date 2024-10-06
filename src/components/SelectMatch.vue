<template>
  <div class="common-container">
    <div class="match-list">
      <div
        v-for="(match, index) in matchArray"
        :key="index"
        class="match-box"
        @click="handleSelect(index)"
        :style="{
          backgroundColor: selectedButton === index ? 'blue' : 'white',
          color: selectedButton === index ? 'white' : 'black'
        }"
      >
        <div class="match-info">
          <label><strong>경기번호: {{ match.match_no }}</strong></label> <label><strong>상태:</strong></label> {{ match.statusCode }}
          <br/>
          <label><strong>{{ match.match_name }}{{ match.round }} {{ match.venue_name }}</strong></label>
          <br/>
          <label><strong>경기 일시:</strong></label>{{formatTimeToLocal(match.start_datetime)}} ~ {{ formatTimeToLocal(match.end_datetime)}}
          <br/>
          <label><strong>입찰 기간:</strong></label>{{formatTimeToLocal(match.bid_open_datetime)}} ~ {{ formatTimeToLocal(match.bid_close_datetime)}}
          <span v-if = "isAdmin">
            <strong>승인 상태:</strong> {{ match.approved === 'Y' ? '승인' : '미승인' }}
          </span>
        </div>
      </div>
    </div>
    <p>{{ message }}</p>
  </div>
</template>


<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { url, API, messageCommon } from '../utils/messagesAPIs';
import { formatTimeToLocal } from '../utils/commonFunction.js';

export default {
  setup(props, { emit }) {
    const sessionUserId = ref('');
    const sessionUserType = ref('');
    const isAdmin = ref(false);
    const tableName = ref('');
    const matchArray = ref([]);
    const selectedButton = ref(null);
    const message = ref('');
    const router = useRouter();

    const fetchSessionUserId = async () => {
      try {
        const response = await axios.get(API.GET_SESSION_USERID, { withCredentials: true });
        if (response.status === 200) {
          sessionUserId.value = response.data.userId;
          sessionUserType.value = response.data.userType;
        }
      } catch (error) {
        alert('로그인이 필요합니다.');
      }
    };

    const fetchMatches = async () => {
      let api;
        if (tableName.value === "user") {
          api = "GET_ALL_APPROVED_MATCHES";
        } else if (tableName.value === "admin") {
          api = "GET_ALLMATCHES";
        }
      try {
        const response = await axios.get(API[api], {
          params: {
            userId: sessionUserId.value,
            userType: sessionUserType.value
          }
        });
        if (response.status === 200) {
          matchArray.value = response.data.map(match => {
            const { bid_open_datetime, bid_close_datetime, bid_open_status } = match;

            let statusCode = '';
            if (bid_open_status === 'F') {
                // alert('F');
                statusCode = '낙찰종료';
              } else if (bid_open_datetime && bid_close_datetime) {
                const bidOpenDate = new Date(bid_open_datetime);
                const bidCloseDate = new Date(bid_close_datetime);
                const now = new Date(); // 현재 시간 계산

                if (now < bidOpenDate) {
                  statusCode = '입찰 시작 전';
                } else if (now > bidCloseDate) {
                  statusCode = '입찰 종료';
                } else {
                  statusCode = '입찰 중';
                }
              } else {
                statusCode = '상태 정보 없음'; // datetime 정보가 없을 경우 예외 처리
              }

            return {
              ...match,
              statusCode
            };
          });
        }
      } catch (error) {
        handleError(error);
      }
    };

    const handleSelect = (index) => {
      const match = matchArray.value[index];
      sessionStorage.setItem('matchNumber', match.match_no);
      selectedButton.value = selectedButton.value === index ? null : index;
      message.value = '';
      emit('update-status', {
        isLoggedIn: true,
        hasSelectedMatch: true
      });
      let urltogo;
      if (tableName.value === "user") {
          urltogo = "bid";
        } else if (tableName.value === "admin") {
          urltogo = "bidresults";
        }
      router.push(url[urltogo]);
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

    onMounted(async () => {
      const sessiontableName = sessionStorage.getItem('tableName');
      if (sessiontableName) {
        tableName.value = sessiontableName;
      }
      if (tableName.value === 'admin') {
        isAdmin.value = true;
    }
      await fetchSessionUserId();
      await fetchMatches();
    });

    return {
      sessionUserId,
      sessionUserType,
      isAdmin,
      matchArray,
      selectedButton,
      message,
      formatTimeToLocal,
      handleSelect,
    };
  }
};
</script>

<style scoped>
.match-list {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.match-list {
  display: flex;
  flex-direction: column; /* 수직으로 배열 */
  gap: 3px; /* 박스 사이 간격 */
}

.match-box {
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 10px;
  width: 100%; /* 박스가 컨테이너의 너비를 차지하도록 */
  max-width: 600px; /* 원하는 경우, 최대 너비 설정 */
  cursor: pointer;
  /* transition: background-color 0.3s, color 0.3s; */
  margin: 0 auto; /* 가운데 정렬을 위해 */
}

.match-info {
  font-size: 14px;
}

.match-box:hover {
  background-color: lightblue;
}

</style>
