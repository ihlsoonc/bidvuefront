<template>
  <div class="common-container">
    <div v-if="!venueArray || venueArray.length == 0" class="message-box ">현재 정보가 없습니다.</div>
    <div>
      <br/>
      <h5>경기장 정보</h5>
      <table v-if="venueArray.length > 0">
        <thead>
          <tr>
            <th>경기장 코드</th>
            <th>경기장 이름</th>
            <th>경기장 위치 정보</th>
            <th>경기장 일반 정보</th>
            <th>수정</th>
            <th>삭제</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(venue, index) in venueArray" :key="index">
            <td>{{ venue.venue_cd }}</td>
            <td>{{ venue.venue_name }}</td>
            <td>{{ venue.venue_place_info }}</td>
            <td>{{ venue.venue_general_info }}</td>
            <td>
              <button
                @click="handleUpdate(index)"
                :class="{ active: selectedUpdateButton === index }"
                class="small-button"
              >
                수정
              </button>
            </td>
            <td>
              <button
                @click="handleDelete(index)"
                :class="{ active: selectedDeleteButton === index }"
                class="small-button"
              >
                삭제
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="buttons-containers">
      <button
      :class="['action-button', { 'action-button-disabled': canUpdate || canDelete }]"
      @click="handleInsert"
        :disabled="canUpdate || canDelete"
      >
        신규 경기장 추가
      </button>
    </div>

    <div v-if="canInsert || canUpdate || canDelete" class="content-container">
      <div>
        <br/>
        <div v-if="guideMessage" class="message-box">{{ guideMessage }}</div>
        <table >
          <tbody>
            <tr>
              <td>경기장 코드</td>
              <td :class="['table-cell', { disabled: canUpdate }]">
                <input
                  type="text"
                  :placeholder="canInsert ? '숫자 세 자리를 입력하세요.' : ''"
                  v-model="venueData.venueCd"
                  @input="handleInputChange(1, $event.target.value)"
                  :readOnly="canUpdate || canDelete"
                  maxlength="3"
                />
              </td>
            </tr>
            <tr>
              <td>경기장 이름</td>
              <td>
                <input
                  type="text"
                  v-model="venueData.venueName"
                  :placeholder="canInsert ? '이름은 40자 이내입니다.' : ''"
                  @input="handleInputChange(2, $event.target.value)"
                  :readOnly="canDelete"
                />
              </td>
            </tr>
            <tr>
              <td>경기장 위치 정보</td>
              <td>
                <input
                  type="text"
                  :placeholder="canInsert ? '위치 안내 정보' : ''"
                  v-model="venueData.venuePlaceInfo"
                  @input="handleInputChange(3, $event.target.value)"
                  :readOnly="canDelete"
                />
              </td>
            </tr>
            <tr>
              <td>경기장 일반 정보</td>
              <td>
                <input
                  type="text"
                  :placeholder="canInsert ? '경기장 일반 정보' : ''"
                  v-model="venueData.venueGeneralInfo"
                  @input="handleInputChange(4, $event.target.value)"
                  :readOnly="canDelete"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <!-- :disabled="!canInsert && !canUpdate" -->
        <div class="buttons-containers">
          <button
            :class="{ 'submit-button-disabled': !canInsert && !canUpdate && !canDelete }"
            @click="handleSubmit"
            :disabled="!canInsert && !canUpdate && !canDelete"
            class="submit-button"
          >
            확인
          </button>

          <button
            :class="{ 'submit-button-disabled': !canInsert && !canUpdate && !canDelete }"
            @click="handleSubmitCancel"
            :disabled="!canInsert && !canUpdate && !canDelete"
            class="action-button"
          >
            취소
          </button>
        </div>
      </div>
    </div>
    <p style="font-size: large;">{{ message }}</p>
  </div>
</template>

<script>
import { ref, computed,onMounted } from 'vue';
import axios, { HttpStatusCode } from 'axios';
import { useRouter } from 'vue-router';
import { url, API, messageCommon } from '../utils/messagesAPIs';

export default {
  setup() {
    const sessionUserId = ref('');
    const venueArray = ref([]);
    const venueData = ref({
      venueCd: '',
      venueName: '',
      venuePlaceInfo: '',
      venueGeneralInfo: '',
    });
    const selectedUpdateButton = ref(null);
    const selectedDeleteButton = ref(null);
    const canInsert = ref(false);
    const canUpdate = ref(false);
    const canDelete = ref(false);
    const message = ref('');
    const router = useRouter();

    // Computed properties
    const guideMessage = computed(() => {
      if (canInsert.value) return '정보 입력 후 확인버튼을 클릭하세요.';
      if (canUpdate.value) return '경기 정보를 수정한 후 확인버튼을 클릭하세요.';
      if (canDelete.value) return '삭제할 정보가 맞으면 확인버튼을 클릭하세요.';
      return '';
    });

    const fetchVenues = async () => {
      try {
        const response = await axios.get(API.GET_ALL_VENUES);
        if (response.status == 200) {
          venueArray.value = response.data;
          message.value = response.data.message;
        }
      } catch (error) {
        handleError(error);
      }
    };

    const fetchSessionUserId = async () => {
      try {
        const response = await axios.get(API.GET_SESSION_USERID, { withCredentials: true });
        sessionUserId.value = response.data.userId;
      } catch (error) {
        alert('로그인이 필요합니다.');
        router.push(url.adminlogin);
      }
    };

    const handleInsert = () => {
      selectedDeleteButton.value = null;
      selectedUpdateButton.value = null;
      canInsert.value = true;
      canUpdate.value = false;
      canDelete.value = false;
      message.value = '';
      resetForm();
    };

    const handleInsertCancel = () => {
      canInsert.value = false;
      canUpdate.value = false;
      canDelete.value = false;
      message.value = '';
      resetForm();
    };

    const handleUpdate = (index) => {
      selectedDeleteButton.value = null;
      canUpdate.value = true;
      canDelete.value = false;
      canInsert.value = false;
      message.value = '';

      selectedUpdateButton.value = (selectedUpdateButton.value === index) ? null : index;

      if (selectedUpdateButton.value === null) {
        resetForm();
      } else {
        setNewVenueData(index);
      }
    };

    const handleDelete = async (index) => {
      selectedUpdateButton.value = null;
      canDelete.value = true;
      canInsert.value = false;
      canUpdate.value = false;
      message.value = '';

      selectedDeleteButton.value = (selectedDeleteButton.value === index) ? null : index;

      if (selectedDeleteButton.value === null) {
        resetForm();
      } else {
        setNewVenueData(index);
      }
    };

    const setNewVenueData = (index) => {
      const venue = venueArray.value[index];
      venueData.value = {
        venueCd: venue.venue_cd,
        venueName: venue.venue_name,
        venuePlaceInfo: venue.venue_place_info,
        venueGeneralInfo: venue.venue_general_info,
      };
    };

    const handleSubmitCancel = async () => {
      selectedUpdateButton.value = null;
      selectedDeleteButton.value = null;
      resetForm();
      canUpdate.value = false;
      canInsert.value = false;
      canDelete.value = false;
    };

    const handleSubmit = async () => {

      if (!canDelete.value && !validateInput()) return;

      try {
        let response;

        if (canInsert.value) {
          response = await axios.post(API.ADD_VENUE, venueData.value);
        } else if (canUpdate.value) {
          response = await axios.post(API.UPDATE_VENUE, venueData.value);
        } else if (canDelete.value) {
          response = await axios.post(API.DELETE_VENUE, venueData.value);
        }

        if (response && response.status === 200) {
          message.value = response.data.message;
          fetchVenues();
        }
      } catch (error) {
        if (error.status === HttpStatusCode.Conflict) { 
          message.value = error.response.data;
          canDelete.value = false;
          canInsert.value = true;
          canUpdate.value = false;
          selectedUpdateButton.value = null;
          selectedDeleteButton.value = null;
          return
        } else {
          handleError(error);
        }
      }
      canDelete.value = false;
      canInsert.value = false;
      canUpdate.value = false;
      selectedUpdateButton.value = null;
      selectedDeleteButton.value = null;
      resetForm();

    };

    const handleInputChange = (inputNumber, value) => {
      const updatedVenueData = { ...venueData.value };

      switch (inputNumber) {
        case 1:
          updatedVenueData.venueCd = value;
          break;
        case 2:
          updatedVenueData.venueName = value;
          break;
        case 3:
          updatedVenueData.venuePlaceInfo = value;
          break;
        case 4:
          updatedVenueData.venueGeneralInfo = value;
          break;
        default:
          break;
      }

      venueData.value = updatedVenueData;
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

    const validateInput = () => {
      const { venueCd, venueName } = venueData.value;
      if (!venueCd) {
        alert("경기장 코드를 입력해 주세요.");
        return false;
      }
      if (!venueName) {
        alert("경기장 이름을 입력해 주세요.");
        return false;
      }
      return true;
    };


    const resetForm = () => {
      venueData.value = {
        venueCd: '',
        venueName: '',
        venuePlaceInfo: '',
        venueGeneralInfo: '',
      };
    };

    onMounted(async () => {
      await fetchSessionUserId();
      await fetchVenues();
    });

    return {
      sessionUserId,
      venueArray,
      venueData,
      selectedUpdateButton,
      selectedDeleteButton,
      canInsert,
      canUpdate,
      canDelete,
      message,
      handleInsert,
      handleInsertCancel,
      handleUpdate,
      handleDelete,
      handleSubmitCancel,
      handleSubmit,
      handleInputChange,
      guideMessage,
      resetForm,
    };
  }
};
</script>

<style scoped>
/* 여기에 CSS를 추가하세요. */
</style>
