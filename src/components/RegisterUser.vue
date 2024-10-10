<template>
  <div class="common-container">
    <h5>사용자 등록 및 수정</h5>
      <div class="input-box">
        <!-- 전화번호 입력 -->
        <label>
            전화번호:
            <input
              type="text"
              v-model="userData.telno"
              class="input"
              placeholder="전화번호를 입력하세요."
              minlength="10" maxlength="11"
              autocomplete="tel" 
              @input="checkTelNumber"
            />
        </label>
        <button @click="handleTelnoCheck" type="button">인증번호 발송</button>
        <!-- 인증번호 입력 -->
        <div v-if="codeInputMode" class="rowflex-container">
          <input
            type="text"
            v-model="userData.authNumber"
            class="input"
            style="font-size: 23px; margin-right: 10px;"
            minlength="6" maxlength="6"
            placeholder="인증번호 6자리를 입력하세요."
            @input="checkAuthNumber"
          />
          <button @click="handleTelnoCheck" type="button">재발송</button> <!-- 재발송 이벤트 핸들러 분리 -->
        </div>
        <div v-if="telmsg" class="message-box">{{ telmsg }}</div>

        <!-- 암호 입력 -->
        <label>
          암호:
          <input
            type="password"
            v-model="userData.password"
            class="input"
            placeholder="암호를 입력하세요."
            autocomplete="new-password" 
          />
        </label>

        <!-- 사용자 이름 입력 -->
        <label>
          사용자 이름:
          <input
            type="text"
            v-model="userData.userName"
            class="input"
            placeholder="이름을 입력하세요."
            autocomplete="name" 
          />
        </label>

        <!-- 이메일 입력 -->
        <label>
          이메일:
          <input
            type="email"
            v-model="userData.email"
            class="input"
            placeholder="이메일을 입력하세요."
            autocomplete="email" 
          />
        </label>

        <!-- 우편번호 입력 -->
        <label>
          우편번호:
          <input
            type="number"
            v-model="userData.postCode"
            class="input"
            placeholder="우편번호를 입력하세요."
            min="10000" max="99999"
            autocomplete="postal-code" 
          />
        </label>

        <!-- 주소 입력 -->
        <label>
          주소 1:
          <input
            type="text"
            v-model="userData.addr1"
            class="input"
            placeholder="주소를 입력하세요."
            autocomplete="address-line1" 
          />
        </label>
        <label>
          주소 2:
          <input
            type="text"
            v-model="userData.addr2"
            class="input"
            placeholder="세부 주소를 입력하세요."
            autocomplete="address-line2" 
          />
        </label>

        <!-- 사용자 타입 선택 (관리자용) -->
        <label v-if="!isUserTable">
          사용자 타입:
          <select
            v-model="userData.userType"
            class="input"
            autocomplete="off"
          >
            <option v-for="(label, key) in adminTypes" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
        </label>
        
        <!-- 제출 버튼 -->
        <br/><br/>
        <button @click="handleSubmit">입력 내용 제출</button>
      </div>
      
      <!-- 메시지 박스 -->
      <div v-if="message" class="message-box">{{ message }}</div>

</div>
</template>
l


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
    const codeInputMode = ref(false);
    const isValidTelno = ref(false);
    const telmsg = ref('');

    const handleTelnoCheck = async () => {
      userData.value.authNumber = '';
      if (!userData.value.telno ) {
          alert("전화번호를 입력해 주세요.");
          return false;
      }
    
      const telnoPattern = /^\d{11}$/; 

      if (!telnoPattern.test(userData.value.telno)) {
        alert("전화번호는 11자리 숫자여야 합니다.");
        return false;
      }
      codeInputMode.value = true;
      try {
        const response = await axios.post(API.SEND_ONE_SMS, {
          ...userData.value,   
          table: tableName.value  
        });
        // 성공 처리
        if (response.status === 200) {
          telmsg.value = response.data.message+response.data.verificationCode;
          message.value = '';
        }
      } catch (error) {
        telmsg.value = error.response.data;
      }

    }
    const checkTelNumber = () =>{
        telmsg.value = "전화번호가 변경되었습니다. 인증번호발송을 눌러주세요."
        isValidTelno.value = false;
    }

    const checkAuthNumber = () =>{
      if (userData.value.authNumber.length === 6) {
          compareAuthNumber(); // 원하는 함수 호출
      }
    }

    const compareAuthNumber = async () =>{
      try {
        const response = await axios.post(API.VERIFY_CODE, {
          ...userData.value,   
          table: tableName.value  
        });
        // 성공 처리
        if (response.status === 200) {
          telmsg.value = response.data.message;
          isValidTelno.value = true;
          codeInputMode. value = false;
          userData.value.authNumber = '';


        }
      } catch (error) {
        telmsg.value = error.response.data;
      }
 
    }

    const handleSubmit = async () => {
      if (!validateInput(userData.value)) {
        return;
      }
      try {
        const response = await axios.post(API.REGISTER_USER, {
          ...userData.value,   
          table: tableName.value  
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
      const { password, userName, userType } = userData;

      if (!isValidTelno.value) {
        alert("전화번호 인증해 주세요.");
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

      // if (!email || email.trim() === "") {
      //   alert("이메일을 입력해 주세요.");
      //   return false;
      // }
      if (tableName.value != 'user') {
        if (!userType || userType.trim() === "") {
          alert("사용자 타입을 선택해 주세요.");
          return false;
        }
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
    if (tableName.value == 'user') {
      isUserTable.value = true;
    }
    });

    return {
      userData,
      message,
      telmsg,
      isUserTable,
      isValidTelno,
      codeInputMode,
      checkAuthNumber,
      checkTelNumber,
      compareAuthNumber,
      adminTypes: ADMIN_TYPES,
      handleTelnoCheck,
      handleSubmit
    };
  }
 }
</script>

<style scoped>
/* 여기에 CSS를 추가하세요 */
</style>
