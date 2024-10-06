<template>
  <div class="find-container">
    <!-- 탭 선택 -->
    <div class="tabs">
      <button
        :class="{ active: activeTab === 'findId' }"
        @click="activeTab = 'findId'"
      >
        ID 찾기
      </button>
      <button
        :class="{ active: activeTab === 'findPassword' }"
        @click="activeTab = 'findPassword'"
      >
        비밀번호 변경
      </button>
    </div>

    <!-- ID 찾기 탭 -->
    <div v-if="activeTab === 'findId'" class="find-container">
      <h5>ID 찾기</h5>
      <input v-model="email" type="email" placeholder="이메일 입력" />
      <input v-model="username" type="text" placeholder="이름 입력" />
      <button @click="findId">ID 찾기</button>
      <div class="messagebox">
        <p v-if="message">{{ message }}</p>
        <p v-if="foundId">아이디: {{ foundId }}</p>
      </div>
    </div>

    <!-- 비밀번호 찾기 탭 -->
    <div v-if="activeTab === 'findPassword'" class="tab-content">
      <h5>비밀번호 재설정</h5>
      <input v-model="id" type="text" placeholder="ID 입력" :disabled="updateMode" />
      <input v-model="currentPassword" type="password" placeholder="현재 비밀번호 입력" :disabled="updateMode" />

      <button @click="handleValidate">확인</button> 
      <div v-if="isValidated">
        <input v-model="newPassword" type="password" placeholder="새 비밀번호 입력" />
        <input v-model="confirmPassword" type="password" placeholder="새 비밀번호 확인" />
        <button @click="changePassword">비밀번호 변경</button>
        <button @click="cancelChange">작업 취소</button>
      </div>
      <p v-if="message">{{ message }}</p>
    </div>
  </div>
</template>


<script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import axios from 'axios';
  import { API, messageCommon} from '../utils/messagesAPIs';

  const activeTab = ref('findId');
  const tableName = ref('');
  const email = ref('');
  const username = ref('');
  const id = ref('');
  const currentPassword = ref('');
  const newPassword = ref('');
  const confirmPassword = ref('');
  const foundId = ref(null);
  const updateMode = ref(false);
  const isValidated = ref(false);
  const message = ref('');
  const route = useRoute();

  // ID 찾기 로직 (예시)
  const findId = async () => {
    message.value = '';

    if (!email.value || !username.value) {
      message.value = '이메일과 이름을 입력해 주세요.';
      return;
    }

    try {
      // 서버로 이메일과 이름을 보내서 ID 조회 요청
      const response = await axios.post(API.FIND_USERID, {
        email: email.value,
        userName: username.value,
        table:tableName.value,
        requestType :"findid"
      });

      // ID가 성공적으로 조회되었을 경우
      if (response.status === 200) {
        foundId.value = response.data.userid; // 서버에서 반환된 ID를 저장
        message.value = '조회된 사용자 ID입니다.';
      }
    } catch (error) {
      handleError(error);
    }
  };

  // 비밀번호 찾기 유효성 검사
  const handleValidate = async () => {
    // ID와 현재 비밀번호 입력 여부 확인
    if (!id.value || !currentPassword.value) {
      message.value = 'ID와 현재 비밀번호를 입력해 주세요.';
      return;
    }

    try {
      // 서버에 유효성 검사 요청 (사용자 ID와 비밀번호 확인)
      const response = await axios.post(API.GET_USER_INFO, {
        query: id.value,
        password: currentPassword.value,
        table:tableName.value,
        requestType :"query"
      });

      // 응답 상태 코드 확인
      if (response.status === 200) {
        isValidated.value = true; // 유효성 검사 성공 시 새로운 비밀번호 입력 가능
        message.value = '';  // 에러 메시지 초기화
        updateMode.value = true;
      }
    } catch (error) {
      handleError(error);
    }
  }
  // 비밀번호 변경 처리 함수
  const cancelChange = async () => {
    updateMode.value = false;
    isValidated.value = false;
  }

  // 비밀번호 변경 처리 함수
  const changePassword = async () => {
    if (!newPassword.value || !confirmPassword.value) {
      message.value = '새 비밀번호와 비밀번호 확인을 입력해 주세요.';
      return;
    }

    if (newPassword.value !== confirmPassword.value) {
      console.log(newPassword.value,confirmPassword.value)
      message.value = '새 비밀번호와 비밀번호 확인이 일치하지 않습니당당.';
      return;
    }

    // 비밀번호 복잡성 검사 (예: 최소 8자 이상, 숫자와 특수문자 포함)
    // const passwordRegex = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&*]).{8,}$/;
    // if (!passwordRegex.test(newPassword.value)) {
    //   message.value = '비밀번호는 최소 8자 이상, 숫자와 특수문자를 포함해야 합니다.';
    //   return;
    // }

    try {
      // 서버에 비밀번호 변경 요청 (예시)
      const response = await axios.post(API.CHANGE_USER_PASSWORD, {
        UserId: id.value,
        password: newPassword.value,
        table:tableName.value
      });

      if (response.status === 200) {
        message.value = '';

        // 비밀번호 변경 성공 시 입력 필드 초기화 및 피드백 제공
        newPassword.value = '';
        confirmPassword.value = '';
        updateMode.value = false;
        alert('비밀번호가 성공적으로 변경되었습니다.');
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
  // 컴포넌트가 마운트될 때 쿼리 파라미터에서 `tab` 값 확인
  onMounted(() => {
    const sessiontableName = sessionStorage.getItem('tableName');
    if (sessiontableName) {
      tableName.value = sessiontableName;
  }

  const tabQuery = route.query.tab;
  if (tabQuery === '2') {
    activeTab.value = 'findPassword';
  } else {
    activeTab.value = 'findId';
  }
});


</script>

<style scoped>
.find-container {
  max-width: 600px;
  margin: auto;
  padding: 10px;
}

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

.messagebox {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 2px;
  box-sizing: border-box;
  border: rgb(132, 55, 55);
}

/* input {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 8px;
  box-sizing: border-box;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
} */
</style>
