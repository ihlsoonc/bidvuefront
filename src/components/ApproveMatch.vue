<template>
    <div class="common-container">
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
                <th>종료 일시</th>
                <th>입찰 가능 여부</th>
                <th>승인상태</th>
                <th>첨부 화일</th>
                <th>첨부 보기</th>
                <th>승인</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(match, index) in matchArray" :key="index">
                <td>{{ match.match_no }}</td>
                <td>{{ match.venue_name }}</td>
                <td>{{ match.match_name }}</td>
                <td>{{ match.round }}</td>
                <td>
                  <p>{{ formatTimeToLocal(match.start_datetime) }}</p>
                </td>
                <td>
                  <p>{{ formatTimeToLocal(match.end_datetime) }}</p>
                </td>

                <td>{{ match.is_bid_available === 1 ? '입찰 가능' : '입찰 불가능' }}</td>
                <td>{{ match.approved === 'Y' ? '승인' : '미승인'}}</td>
                <td>{{ match.filename_attached }}</td>
                <td>
                  <button
                    @click="downloadFile(index)"
                    :class="{ active: selectedViewFileButton === index }"
                    class="small-button"
                  >
                    다운로드
                  </button>
                </td>
                <td>
                  <button v-if="match.approved !== 'Y'"
                    @click="handleApprove(index)"
                    :class="{ active: selectedApproveButton === index }"
                    class="small-button"
                  >
                    승인
                  </button>

                  <button v-if="match.approved =='Y'"
                    @click="handleResetApprove(index)"
                    :class="{ active: selectedResetApproveButton === index }"
                    class="small-button"
                  >
                    승인취소
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
      </div>

  
      <div v-if="canApprove|| canDisapprove  || canViewFile"  class="content-container">
        <div>
          <br/>
          <div v-if="guideMessage" class="message-box">{{ guideMessage }}</div>
          <table>
            <tbody>
              <tr>
                <td>경기 번호</td>
                <td>
                  <input
                    type="number"
                    :value="matchData.matchNumber"
                    disabled
                  />
                </td>
              </tr>
              <tr>
                <td>경기장 코드</td>
                <td class="table-cell">
                  {{ matchData.venueCd }}
                </td>
              </tr>
              <tr>
                <td>경기장 이름</td>
                <td class="table-cell">
                  <input
                    type="text"
                    :value="matchData.venueName"
                    disabled
                  />
                </td>
              </tr>
              <tr>
                <td>경기명</td>
                <td class="table-cell">
                  <input
                    type="text"
                    :value="matchData.matchName"
                    disabled
                  />
                </td>
              </tr>
              <tr>
                <td>라운드명</td>
                <td class="table-cell">
                  <input
                    type="text"
                    :value="matchData.round"
                    disabled
                  />
                </td>
              </tr>
              <tr>
                <td>시작 일시</td>
                <td class="table-cell">
                  <input
                    type="datetime-local"
                    :value="matchData.startTime"
                    disabled
                  />
                </td>
              </tr>
              <tr>
                <td>종료 일시</td>
                <td class="table-cell">
                  <input
                    type="datetime-local"
                    :value="matchData.endTime"
                    disabled
                  />
                </td>
              </tr>
              <tr>
                <td>입찰 가능 여부</td>
                <td>
                  <input
                    :value="matchData.isBidAvailable === 1 ? '입찰 가능' : '입찰 불가능'"
                    disabled
                  />
                </td>
              </tr>
              <tr>
                <td>대회 정보 첨부</td>
                <td class="table-cell">
                  <button @click="downloadFile(-1)">파일 다운로드</button>
                </td>
              </tr>
              <tr>
                <td>첨부화일명</td>
                <td class="table-cell">
                  <input
                    type="text"
                    :value="matchData.fileName"
                    disabled
                  />
                </td>
              </tr>
            </tbody>
          </table>
  
          <div class="buttons-containers">
            <button
              :class="['submit-button', { 'submit-button-disabled': !canDisapprove && !canApprove && !canViewFile }]"
              @click="handleSubmit"
              :disabled="!canDisapprove && !canApprove && !canViewFile"
            >
              확인
            </button>
            <button
              :class="['action-button', { 'submit-button-disabled': !canDisapprove && !canApprove && !canViewFile }]"
              @click="handleSubmitCancel"
              :disabled="!canDisapprove && !canApprove && !canViewFile"
            >
              취소
            </button>
          </div>
        </div>
      </div>
      <div v-if="message" class="message-box">{{ message }}</div>
    </div>
  </template>
  
  <script setup>
  
  import { ref, computed, onMounted } from 'vue';
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  import { formatTimeToLocal } from '../utils/commonFunction';
  import { url, API, messageCommon } from '../utils/messagesAPIs';

  // Reactive references
  const sessionUserId = ref('');
  const sessionTelno = ref('');
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
    isBidAvailable: 1,
    fileName: '',
  });
  const venueArray = ref([]);
  const selectedApproveButton = ref(null);
  const selectedResetApproveButton = ref(null);
  const selectedViewFileButton = ref(null);
  const canApprove = ref(false);
  const canDisapprove = ref(false);
  const canViewFile = ref(false);
  const message = ref('');
  const router = useRouter();
  
  // Computed properties
  const guideMessage = computed(() => {
    if (canDisapprove.value) return '승인 취소할 내용이 맞으면 확인버튼을 클릭하세요.';
    if (canApprove.value) return '승인할 내용이 맞으면 확인버튼을 클릭하세요.';
    if (canViewFile.value) return '상세정보입니다.';
    return '';
  });

  const fetchMatches = async () => {
    try {
      const response = await axios.get(API.GET_ALLMATCHES, { params: { userId: sessionUserId.value, userType :sessionUserType.value} });
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

  const handleApprove = (index) => {
    const match = matchArray.value[index];
    if (match.approved === 'Y') {
      alert('이미 승인된 건입니다.')
      return
    }
    // Toggle the selected button
    selectedApproveButton.value = (selectedApproveButton.value === index) ? null : index;
    selectedViewFileButton.value = null;
    // Update states
    canApprove.value = selectedApproveButton.value !== null;
    canDisapprove.value = null;
    
    // Set new match data or reset form
    if (selectedApproveButton.value === null) {
      resetForm();
    } else {
      setSelectedMatchData(index);
    }
  };
    const handleResetApprove = (index) => {
    const match = matchArray.value[index];
    if (match.approved !== 'Y') {
      alert('아직 승인이 안된 건입니다.')
      return
    }
    // Toggle the selected button
    selectedResetApproveButton.value = (selectedResetApproveButton.value === index) ? null : index;
    selectedViewFileButton.value = null;
    canApprove.value = null;
    // Update states
    canDisapprove.value = selectedResetApproveButton.value !== null;
    
    // Set new match data or reset form
    if (selectedResetApproveButton.value === null) {
      resetForm();
    } else {
      setSelectedMatchData(index);
    }
  };
  const setSelectedMatchData = (index) => {
    const match = matchArray.value[index];
    const formattedStartDate = formatTimeToLocal(match.start_datetime);
    const formattedEndDate = formatTimeToLocal(match.end_datetime);
    matchData.value = {
      matchNumber: match.match_no,
      venueCd: match.venue_cd,
      venueName: match.venue_name,
      matchName: match.match_name,
      round: match.round,
      startTime: formattedStartDate,
      endTime: formattedEndDate,
      isBidAvailable: match.is_bid_available,
      fileName: match.filename_attached,
    };
  };
  
  const handleSubmit = async () => {
    try {
      let actionType = 'Y';
      if (canDisapprove.value) {
        actionType = 'N';
      }
      const requestData = { ...matchData.value, userId: sessionUserId.value, userType:sessionUserType.value, actionType : actionType};
      const  response = await axios.post(API.APPROVE_MATCH, requestData);
      if (response.status === 200) {
        message.value = '성공적으로 작업이 수행되었습니다.';
        fetchMatches();
        resetState();
      }
    } catch (error) {
      handleError(error);
    }
  };
  const handleSubmitCancel = () => {
    resetState();
  };

  const downloadFile = async (index) => {
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
  
  const fetchSessionUserId = async () => {
        try {
          const response = await axios.get(API.GET_SESSION_USERID, { withCredentials: true });
          sessionTelno.value = response.data.telno;
          sessionUserId.value = response.data.userId;
          sessionUserType.value = response.data.userType;
          if (!(sessionUserType.value === 'H' || sessionUserType.value === 'A')) {
            alert('메뉴에 접근 권한이 없습니다. 경기선택화면으로 이동합니다.');
            router.push(url.selectmatch);
          }
        } catch (error) {
          alert('로그인이 필요합니다.');
          router.push(url.adminlogin);
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
      isBidAvailable: 1,
      fileName: ''
    };
  };
  
  const resetState = () => {
    canDisapprove.value = false;
    canApprove.value = false;
    canViewFile.value = false;
    selectedApproveButton.value = null;
    selectedViewFileButton.value = null;
    resetForm();
  };
  
  // Lifecycle hooks
  onMounted(async () => {
        await fetchSessionUserId();
        await fetchVenues();
        await fetchMatches();
  });
  
  </script>
  
  <style scoped>
  /* 스타일은 필요에 맞게 추가하세요. */
  </style>
  