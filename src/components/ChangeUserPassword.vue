<template>
  <div class="input-box">
    <!-- 탭 선택 -->
    <div class="tabs">
      <button
        :class="{ active: activeTab === 'resetPassword' }"
        @click="activeTab = 'resetPassword'"
      >
        비밀번호 찾기
      </button>
      <button
        :class="{ active: activeTab === 'changePassword' }"
        @click="activeTab = 'changePassword'"
      >
        비밀번호 변경
      </button>
    </div>

    <!-- 비밀번호 찾기 탭 -->
    <div v-if="activeTab === 'resetPassword'" class="input-box">
      <h5>비밀번호 찾기</h5>
        전화번호:
        <input
          v-model="userData.telno"
          type="text"
          class="input"
          placeholder="전화번호를 입력하세요."
          minlength="11"
          maxlength="11"
          :readonly="isValidTelno"
          @input="checkTelNumber"
        />
      <button @click="handleTelnoCheck" type="button">인증번호 발송</button>
      <!-- 인증번호 입력 -->
      <div v-if="codeInputMode" class="rowflex-container">
        <input
          type="text"
          v-model="userData.authNumber"
          class="input"
          style="font-size: 23px; margin-right: 10px;"
          minlength="6"
          maxlength="6"
          placeholder="인증번호 6자리를 입력하세요."
          @input="checkAuthNumber"
        />
        <button @click="handleTelnoCheck" type="button">재발송</button>
        <div v-if="isValidTelno">
          <input v-model="newPassword" type="password" placeholder="새 비밀번호 입력" />
          <input v-model="confirmPassword" type="password" placeholder="새 비밀번호 확인" />
          <button @click="changePassword">비밀번호 변경</button>
          <button @click="cancelChange">작업 취소</button>
        </div>
      </div>
      <div v-if="telmsg" class="message-box">{{ telmsg }}</div>
    </div>

    <!-- 비밀번호 변경 탭 -->
    <div v-if="activeTab === 'changePassword'" class="input-box">
      <h5>비밀번호 변경</h5>
      <input v-model="id" 
        type="text" 
        placeholder="전화번호 입력" 
        minlength="11"
        maxlength="11"
        autocomplete="tel"
        :readonly="isValidated" />
      <input v-model="currentPassword" 
          type="password" 
          placeholder="현재 비밀번호 입력" 
          :readonly="isValidated" />
      <button @click="handleValidate">확인</button>

    </div>
      <div v-if="isValidated || isValidTelno" >
        <input v-model="newPassword" type="password" placeholder="새 비밀번호 입력" />
        <input v-model="confirmPassword" type="password" placeholder="새 비밀번호 확인" />
        <button @click="changePassword">비밀번호 변경</button>
        <button @click="cancelChange">작업 취소</button>
      </div>
      <div v-if="message" class="message-box">{{ message }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { API, messageCommon } from '../utils/messagesAPIs';

const activeTab = ref('resetPassword');
const tableName = ref('');
const id = ref('');
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const isValidTelno = ref(false);
const isValidated = ref(false);
const message = ref('');
const route = useRoute();
const userData = ref({ telno: '', authNumber: '' });
const returnCode = ref('');
const codeInputMode = ref(false);
const telmsg = ref('');
const returnAuthCode = ref('');

// 전화번호 인증 요청
const handleTelnoCheck = async () => {
  userData.value.authNumber = '';
  if (!userData.value.telno) {
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

    if (response.status === 200) {
      returnAuthCode.value = response.data;
      returnCode.value = response.data.code;
      userData.value.authNumber = returnCode.value;
      telmsg.value = response.data.message+response.data.verificationCode;
    }
  } catch (error) {
    telmsg.value = error.response.data;
  }
};

// 전화번호 변경 확인
const checkTelNumber = () => {
  telmsg.value = "전화번호가 변경되었습니다. 인증번호 발송을 눌러주세요.";
  isValidTelno.value = false;
};

// 인증번호 확인
const checkAuthNumber = () => {
  if (userData.value.authNumber.length === 6) {
    compareAuthNumber();
  }
};

// 인증번호 비교
const compareAuthNumber = async () => {
  try {
    const response = await axios.post(API.VERIFY_CODE, {
      ...userData.value,
      table: tableName.value
    });

    if (response.status === 200) {
      telmsg.value = response.data.message;
      isValidTelno.value = true;
      codeInputMode.value = false;
      userData.value.authNumber = '';
    }
  } catch (error) {
    telmsg.value = error.response.data;
  }
};

// 비밀번호 변경 유효성 확인
const handleValidate = async () => {
  if (!id.value || !currentPassword.value) {
    message.value = '전화번호와 현재 비밀번호를 입력해 주세요.';
    return;
  }

  try {
    const response = await axios.post(API.GET_USER_INFO, {
      query: id.value,
      password: currentPassword.value,
      table: tableName.value,
      queryType: "telno"
    });

    if (response.status === 200) {
      isValidated.value = true;
      message.value = '';
    }
  } catch (error) {
    handleError(error);
  }
};

// 비밀번호 변경 취소
const cancelChange = async () => {
  isValidated.value = false;
  isValidTelno.value = false;
  telmsg.value ='';
};

// 비밀번호 변경
const changePassword = async () => {
  if (!newPassword.value || !confirmPassword.value) {
    message.value = '새 비밀번호와 비밀번호 확인을 입력해 주세요.';
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    message.value = '새 비밀번호와 비밀번호 확인이 일치하지 않습니다.';
    return;
  }

  try {
    let paramId;
    if (isValidTelno.value) {
      paramId = userData.value.telno;
    } else {
      paramId = id.value;
    }
    const response = await axios.post(API.CHANGE_USER_PASSWORD, {
      telno: paramId,
      password: newPassword.value,
      table: tableName.value
    });

    if (response.status === 200) {
      message.value = '';
      newPassword.value = '';
      confirmPassword.value = '';
      alert('비밀번호가 성공적으로 변경되었습니다.');
    }
    isValidTelno.value = false;
    isValidated.value = false;
  } catch (error) {
    handleError(error);
  }
};

// 에러 처리
const handleError = (error) => {
  if (error.response) {
    message.value = error.response.data;
  } else if (error.request) {
    message.value = messageCommon.ERR_NETWORK;
  } else {
    message.value = messageCommon.ERR_ETC;
  }
};

// 컴포넌트가 마운트될 때 실행
onMounted(() => {
  const sessiontableName = sessionStorage.getItem('tableName');
  if (sessiontableName) {
    tableName.value = sessiontableName;
  }

  const tabQuery = route.query.tab;
  if (tabQuery === '2') {
    activeTab.value = 'changePassword';
  } else {
    activeTab.value = 'resetPassword';
  }
});
</script>

<style scoped>
.tabs {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.tabs button {
  padding: 10px 20px;
  cursor: pointer;
  background-color: #f0f0f0;
  border: none;
}

.tabs button.active {
  background-color: #007bff;
  color: white;
}

.tab-content {
  text-align: center;
}
</style>
