<template>
  <div class="common-container">
    <div v-if="!venueArray || venueArray.length == 0" class="message-box ">현재 정보가 없습니다.</div>
      <div>
        <br/>
        <h5>경기 정보</h5>
        <table v-if="matchArray.length > 0">
          <thead>
            <tr>
              <th>경기 번호</th>
              <th>경기장 이름</th>
              <th>경기명</th>
              <th>라운드</th>
              <th>시작 일시</th>

              <th>입찰 가능 여부</th>
              <th>입찰 개시</th>

              <th>승인 상태</th>
              <th>첨부 보기</th>
              <th>변경</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(match, index) in matchArray" :key="index">
              <td>{{ match.match_no }}</td>
              <td>{{ match.venue_name }}</td>
              <td>{{ match.match_name }}</td>
              <td>{{ match.round }}</td>
              <td class="table-cell">
                <p>{{ formatTimeToLocal(match.start_datetime) }} ~ {{ formatTimeToLocal(match.end_datetime) }}</p>
              </td>
              <td>{{ match.is_bid_available === 1 ? '입찰 가능' : '입찰 불가능' }}</td>
              <td class="table-cell">
                <p>{{ formatTimeToLocal(match.bid_open_datetime) }} ~ {{ formatTimeToLocal(match.bid_close_datetime) }}</p>
              </td>
              <td>{{ match.approved === 'Y' ? '승인' : '미승인' }}</td>
              <!-- <td>{{ match.filename_attached }}</td> -->
              <td>
                <button
                  @click="handleDownload(index)"
                  :class="{ active: selectedDownloadButton === index }"
                  class="small-button"
                >
                  첨부보기
                </button>
              </td>
              <td>
                <div v-if="match.approved !== 'Y'">
                <button
                  @click="handleUpdate(index)"
                  :class="{ active: selectedUpdateButton === index }"
                  class="small-button"
                >
                  수정
                </button>
                <button
                  @click="handleDelete(index)"
                  :class="{ active: selectedDeleteButton === index }"
                  class="small-button"
                >
                  삭제
                </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
    </div>

    <div class="buttons-container">
      <button 
        :class="['action-button', { 'action-button-disabled': canUpdate || canDelete }]"
        @click="handleInsert"
        :disabled="canUpdate || canDelete"
      > 
        경기 추가
      </button>
    </div>
    <div v-if="message" class="message-box">{{ message }}</div>
    <div v-if="message" class="message-box">{{ message2 }}</div>

    <div v-if="canInsert || canUpdate || canDelete" class="content-container">
      <div>
        <br/>
        <div v-if="guideMessage" class="message-box">{{ guideMessage }}</div>
        <table>
          <tbody>
            <tr v-if ="canUpdate|| canDelete">
              <td>경기 번호</td>
              <td :class="['table-cell', { disabled: canUpdate }]">
                <input
                  type="number"
                  v-model="matchData.matchNumber"
                  readonly
                />
              </td>
            </tr>
            <tr>
              <td>경기장 코드</td>
              <td class="table-cell">
                <select
                  v-model="matchData.venueCd"
                  :disabled="!canInsert && !canUpdate"
                  @change="updateVenueName"
                >
                  <option value="">선택하세요</option>
                  <option v-for="venue in venueArray" :key="venue.venue_cd" :value="venue.venue_cd">
                    {{ venue.venue_cd }}
                  </option>
                </select>
              </td>
            </tr>
            <tr>
              <td>경기장 이름</td>
              <td class="table-cell">
                <input
                  type="text"
                  v-model="matchData.venueName"
                  disabled
                />
              </td>
            </tr>
            <tr>
              <td>경기명</td>
              <td class="table-cell">
                <input
                  type="text"
                  placeholder="이름은 30자 이내입니다."
                  v-model="matchData.matchName"
                  @input="handleInputChange('matchName', $event.target.value)"
                  :readonly="canDelete"
                />
              </td>
            </tr>
            <tr>
              <td>라운드명</td>
              <td class="table-cell">
                <input
                  type="text"
                  placeholder="이름은 30자 이내입니다."
                  v-model="matchData.round"
                  @input="handleInputChange('round', $event.target.value)"
                  :readonly="canDelete"
                />
              </td>
            </tr>
            <tr>
              <td>시작 일시</td>
              <td class="table-cell">
                <input
                  type="datetime-local"
                  v-model="matchData.startTime"
                  @input="handleInputChange('startTime', $event.target.value)"
                  :readonly="canDelete"
                />
              </td>
            </tr>
            <tr>
              <td>종료 일시</td>
              <td class="table-cell">
                <input
                  type="datetime-local"
                  v-model="matchData.endTime"
                  @input="handleInputChange('endTime', $event.target.value)"
                  :readonly="canDelete"
                />
              </td>
            </tr>
            <tr>
              <td>입찰 개시</td>
              <td class="table-cell">
                <input
                  type="datetime-local"
                  v-model="matchData.bidOpenTime"
                  @input="handleInputChange('bidOpenTime', $event.target.value)"
                  :readonly="canDelete"
                />
              </td>
            </tr>
            <tr>
              <td>입찰 종료</td>
              <td class="table-cell">
                <input
                  type="datetime-local"
                  v-model="matchData.bidCloseTime"
                  @input="handleInputChange('bidCloseTime', $event.target.value)"
                  :readonly="canDelete"
                />
              </td>
            </tr>
            <tr>
              <td>입찰 가능 여부</td>
              <td>
                <select
                  v-model="matchData.isBidAvailable"
                  @change="handleInputChange('isBidAvailable', $event.target.value)"
                  :readonly="canDelete"
                >
                  <option :value="1">입찰 가능</option>
                  <option :value="0">입찰 불가능</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>대회 정보 첨부</td>
              <td class="table-cell">
                <input
                  type="file"
                  @change="handleFileChange"
                  :readonly="canDelete"
                />
              </td>
            </tr>
            <tr>
              <td>첨부화일명</td>
              <td class="table-cell">
                <input
                  type="text"
                  v-model="matchData.fileName"
                  disabled
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div class="buttons-containers">
          <button
            :class="['submit-button', { 'submit-button-disabled': !canInsert && !canUpdate && !canDelete }]"
            @click="handleSubmit"
            :disabled="!canInsert && !canUpdate && !canDelete"
          >
            확인
          </button>
          <button
            :class="['action-button', { 'submit-button-disabled': !canInsert && !canUpdate && !canDelete }]"
            @click="handleSubmitCancel"
            :disabled="!canInsert && !canUpdate && !canDelete"
          >
            취소
          </button>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import {  url, API, messageCommon} from '../utils/messagesAPIs';
import { formatTimeToLocal } from '../utils/commonFunction';

const router = useRouter();
const sessionUserId = ref('');
const sessionUserType = ref('');
const matchArray = ref([]);
const matchData = ref({
  matchNumber: '',
  venueCd: '',
  venueName: '',
  matchName: '',
  round: '',
  startTime: '',
  endTime: '',
  bidOpenTime: '',
  bidCloseTime: '',
  isBidAvailable: 1,
  fileName: '',
});

const venueArray = ref([]);
const selectedUpdateButton = ref(null);
const selectedDeleteButton = ref(null);
const selectedDownloadButton = ref(null);
const canInsert = ref(false);
const canUpdate = ref(false);
const canDelete = ref(false);
const message = ref('');
const message2 = ref('');
// const router = useRouter();

// Computed properties
const guideMessage = computed(() => {
  if (canInsert.value) return '정보 입력 후 확인버튼을 클릭하세요.';
  if (canUpdate.value) return '경기 정보를 수정한 후 확인버튼을 클릭하세요.';
  if (canDelete.value) return '삭제할 정보가 맞으면 확인버튼을 클릭하세요.';
  return '';
});

// Functions
const updateVenueName = () => {
  const selectedVenue = venueArray.value.find(venue => venue.venue_cd === matchData.value.venueCd);
  matchData.value.venueName = selectedVenue ? selectedVenue.venue_name : '';
};

const handleInputChange = (field, value) => {
  matchData.value[field] = value;
};

const fetchMatches = async () => {
  try {
    const response = await axios.get(API.GET_ALLMATCHES, 
    { params: { userId: sessionUserId.value, userType :sessionUserType.value} });
    if (response.status === 200) {
      matchArray.value = response.data;
    }
  } catch (error) {
    handleError(error);
  }
};

const fetchVenues = async () => {
  try {
    const response = await axios.get(API.GET_ALL_VENUES);
    if (response.status === 200) {
      venueArray.value = response.data;
    }
  } catch (error) {
    handleError(error);
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
const handleInsert = () => {
  selectedDeleteButton.value = null;
  selectedUpdateButton.value = null;
  canInsert.value = true;
  canUpdate.value = false;
  canDelete.value = false;
  resetForm();
};


const handleDownload = async (index) => {
    try {
      let fileName = '';
      // 파일 다운로드 요청

      if (index >= 0) {
        const match = matchArray.value[index];
        fileName = match.filename_attached;
      } else {
        fileName = matchData.value.fileName;
        alert(fileName)
      }
      if (!fileName) {
        alert('첨부화일이 없습니다.')
        return;
      }
      const response = await axios.get(API.DOWNLOAD_MATCHINFO, {
      params: { fileName: fileName }, // 쿼리 파라미터로 파일 이름 전달
      responseType: 'blob', // 응답 타입을 blob으로 설정
      headers: {
        'Content-Type': 'application/octet-stream',
        // 필요한 경우 인증 헤더 추가
      },
      });
      // 파일 데이터를 Blob 형태로 변환
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName); // 파일 이름을 지정
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`파일 다운로드 오류: ${error.message}`);
    }
  };

  const handleUpdate = (index) => {
    // Toggle the selected button
    selectedUpdateButton.value = (selectedUpdateButton.value === index) ? null : index;
    selectedDeleteButton.value = null;
    // Update states
    canInsert.value = false;
    canUpdate.value = selectedUpdateButton.value !== null;
    canDelete.value = false;
    message.value = '';
    message2.value = '';
    
    // Set new match data or reset form
    if (selectedUpdateButton.value === null) {
      resetForm();
    } else {
      setNewMatchData(index);
    }

  };
  const handleDelete = (index) => {
    // Toggle the selected button
    selectedDeleteButton.value = (selectedDeleteButton.value === index) ? null : index;
    selectedUpdateButton.value = null;
    // Update states
    canInsert.value = false;
    canUpdate.value = false;
    canDelete.value = selectedDeleteButton.value !== null;
    message.value = '';
    message2.value = '';
    
    // Set new match data or reset form
    if (selectedDeleteButton.value === null) {
      resetForm();
    } else {
      setNewMatchData(index);
    }
};

const setNewMatchData = (index) => {
  const match = matchArray.value[index];
  
  matchData.value = {
    matchNumber: match.match_no,
    venueCd: match.venue_cd,
    venueName: match.venue_name,
    matchName: match.match_name,
    round: match.round,
    startTime: match.start_datetime,
    endTime: match.end_datetime,
    bidOpenTime: match.bid_open_datetime,
    bidCloseTime: match.bid_close_datetime,
    isBidAvailable: match.is_bid_available,
    fileName: match.filename_attached,
  };
};

const handleSubmit = async () => {
  try {
    if (!canDelete.value && !validateInput()) return;

    const requestData = { ...matchData.value, userId: sessionUserId.value, userType:sessionUserType.value};
    let response;
    if (canInsert.value) {
      response = await axios.post(API.ADD_MATCH, requestData);
    } else if (canUpdate.value) {
      response = await axios.post(API.UPDATE_MATCH, requestData);
    } else if (canDelete.value) {
      response = await axios.post(API.DELETE_MATCH, requestData);
    }
    if (response.status === 200) {
      message.value = response.data.message;
      if (canUpdate.value || canInsert.value) {
      handleFileUpload();
      } 
      fetchMatches();
      resetState();
    }
  } catch (error) {
    handleError(error);
  }

};

// 파일 업로드 핸들러
const handleFileUpload = async () => {

  if (matchData.value.file) {
    const formData = new FormData();
    formData.append('file', matchData.value.file);
    // alert('upload called');
    try {
      // 서버로 파일 업로드
      const response = await axios.post(API.UPLOAD_MATCHINFO, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // 파일 업로드에 적합한 헤더 설정
        },
      });

      if (response.status === 200) {
        message2.value = "파일 업로드가 성공적으로 수행되었습니다.";
      }
    } catch (error) {
      handleError(error);
    }
  } else {
    message2.value = "업로드할 파일이 지정되지 않았습니다.";
  }
};

const handleSubmitCancel = () => {
  resetState();
};

const validateInput = () => {
  const { venueCd, matchName, round, startTime, endTime, bidOpenTime, bidCloseTime, isBidAvailable } = matchData.value;
  
  // 필드 중 하나라도 비어있거나(isBidAvailable을 제외) 기본값이라면 경고 표시

  if (!venueCd) {
    alert("경기장을 선택해 주세요.");
    return false;
  }

  if (!matchName) {
    alert("경기명을 입력해 주세요.");
    return false;
  }

  if (!round) {
    alert("라운드를 입력해 주세요.");
    return false;
  }

  if (!startTime) {
    alert("시작 일시를 입력해 주세요.");
    return false;
  }

  if (!endTime) {
    alert("종료 일시를 입력해 주세요.");
    return false;
  }
  
  if (isBidAvailable === undefined || isBidAvailable === "") {
    alert("입찰 구분을 선택해 주세요.");
    return false;
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (end <= start) {
    alert("종료시간은 시작시간보다 커야 합니다.");
    return false;
  }

  const bstart = new Date(bidOpenTime);
  const bend = new Date(bidCloseTime);

  if (bend <= bstart) {
    alert("입찰 마감시간은 시작시간보다 커야 합니다.");
    return false;
  }
  // 입찰 종료 시간이 경기 시작 시간보다 커서는 안됨
  if (bend >= start) {
    alert("입찰 종료 시간은 경기 시작 시간보다 작아야 합니다.");
    return false;
  }

  return true;
};

const fetchSessionUserId = async () => {
      try {
        const response = await axios.get(API.GET_SESSION_USERID, { withCredentials: true });
        sessionUserId.value = response.data.userId;
        sessionUserType.value = response.data.userType;
        await fetchVenues();
        await fetchMatches()
      } catch (error) {
        alert('로그인이 필요합니다.');
        router.push(url.adminlogin);
      }
};
const handleFileChange = (event) => {
  const file = event.target.files[0];
  matchData.value.file = file;
  matchData.value.fileName = file ? file.name : '';
};

const resetForm = () => {
  matchData.value = {
    matchNumber: '',
    venueCd: '',
    venueName: '',
    matchName: '',
    round: '',
    startTime: '',
    endTime: '',
    bidStartTime: '',
    bidEndTime: '',
    isBidAvailable: 1,
    fileName: ''
  };
};

const resetState = () => {
  canInsert.value = false;
  canUpdate.value = false;
  canDelete.value = false;
  selectedUpdateButton.value = null;
  selectedDeleteButton.value = null;
  resetForm();
};

// Lifecycle hooks
onMounted(async () => {
  await fetchSessionUserId();

});

</script>

<style scoped>
/* 스타일은 필요에 맞게 추가하세요. */
</style>
