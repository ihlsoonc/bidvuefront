<template>
  <div class="common-container">
    <h5>사용자 등록 및 수정</h5>
    <div class="content-container">
      <div class="input-box">
        <form @submit.prevent="handleSubmit">
          <label>
            사용자 ID:
            <input
              type="text"
              v-model="userData.userId"
              class="input"
              placeholder="Enter User ID"
              autocomplete="username" 
            />
          </label>
          <label>
            암호:
            <input
              type="password"
              v-model="userData.password"
              class="input"
              placeholder="Enter Password"
              autocomplete="new-password" 
            />
          </label>
          <label>
            사용자 이름:
            <input
              type="text"
              v-model="userData.userName"
              class="input"
              placeholder="Enter User Name"
              autocomplete="name" 
            />
          </label>
          <label>
            이메일:
            <input
              type="email"
              v-model="userData.email"
              class="input"
              placeholder="Enter Email"
              autocomplete="email" 
            />
          </label>
          <label>
            전화번호:
            <input
              type="tel"
              v-model="userData.telno"
              class="input"
              placeholder="Enter Telephone Number"
              autocomplete="tel" 
            />
          </label>
          <label>
            우편번호:
            <input
              type="text"
              v-model="userData.postCode"
              class="input"
              placeholder="Enter Post Code"
              autocomplete="postal-code" 
            />
          </label>
          <label>
            주소:
            <input
              type="text"
              v-model="userData.addr1"
              class="input"
              placeholder="Enter Address Line 1"
              autocomplete="address-line1" 
            />
          </label>
          <label>
            주소:
            <input
              type="text"
              v-model="userData.addr2"
              class="input"
              placeholder="Enter Address Line 2"
              autocomplete="address-line2" 
            />
          </label>
          <br/>
          <label>
            사용자 타입:
            <select
              v-model="userData.userType"
              class="input"
              autocomplete="off"
              :disabled="isUserTable"
            >
              <option v-for="(label, key) in adminTypes" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </label>
          <br/>
          <br/>
          <button class="submit-button" type="submit">입력 내용 제출</button>
        </form>
        <div class="messagebox">{{ message }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { API, messageCommon, ADMIN_TYPES } from '../utils/messagesAPIs'; // 상태 메시지 임포트

export default {
  setup() {
    const userData = ref({
      userId: '',
      password: '',
      userName: '',
      email: '',
      telno: '',
      postCode: '',
      addr1: '',
      addr2: '',
      userType: ''
    });
    const message = ref('');
    const tableName = ref('');
    const isUserTable = ref(false);

    const handleSubmit = async () => {
      if (!validateInput(userData.value)) {
        return;
      }
      try {
        const response = await axios.post(API.REGISTER_ADMIN, {
          ...userData.value,   // userData의 모든 값들을 펼쳐서 전송
          table: tableName.value  // tableName을 본문에 포함
        });
        // 성공 처리
        if (response.status === 200) {
          message.value = '사용자가 성공적으로 등록되었습니다.';
        }
      } catch (error) {
        handleError(error);
      }
    };

    const validateInput = (userData) => {
      const { userId, password, userName, email, telno, userType } = userData;

      if (!userId || userId.trim() === "") {
        alert("사용자 아이디를 입력해 주세요.");
        return false;
      }

      if (!telno || telno.trim() === "") {
        alert("전화번호를 입력해 주세요.");
        return false;
      }

      if (!password || password.trim() === "") {
        alert("비밀번호를 입력해 주세요.");
        return false;
      }

      if (!userName || userName.trim() === "") {
        alert("사용자 이름을 입력해 주세요.");
        return false;
      }

      if (!email || email.trim() === "") {
        alert("이메일을 입력해 주세요.");
        return false;
      }

      if (!userType || userType.trim() === "") {
        alert("사용자 타입을 선택해 주세요.");
        return false;
      }

      return true;
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

    
    });

    return {
      userData,
      message,
      isUserTable,
      adminTypes: ADMIN_TYPES,
      handleSubmit
    };
  }
 }
</script>

<style scoped>
/* 여기에 CSS를 추가하세요 */
</style>
