<template>
  <div class="common-container">
    <br/>
    <br/>
    <br/>
    <h6 style="text-align: center;">로그인</h6>
    <div class="content-container">
      <div class="input-box">
        <form @submit.prevent="handleSubmit">
          <label>
            사용자 아이디 또는 전화번호
            <input
              type="text"
              name="userIdOrTelno"
              class="input"
              placeholder="아이디"
              v-model="userData.query"
            />
          </label>
          <label>
            암호
            <input
              type="password"
              name="password"
              class="input"
              placeholder="비밀번호"
              v-model="userData.password"
            />
          </label>
          <br/>
          <div><p style="font-size: small;">{{ message }}</p></div>
          <br/>
          <button class="submit-button" type="submit">
            로그인
          </button>
        </form>
        <div class="buttons-containers">
          <button class="xsmall-button" @click="handleFindId">
            아이디찾기
          </button>
          <button class="xsmall-button" @click="handleChangePassword">
            비밀번호 재설정
          </button>
          <button class="xsmall-button" @click="handleRegister">
            회원가입
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API, url, messageCommon} from '../utils/messagesAPIs';

export default {
  setup(props, { emit }) {
    const userData = ref({
      query: '',
      password: '',
    });
    const sessionUserId = ref('');
    const tableName = ref('');
    const message = ref('');
    const router = useRouter();  // route 선언

    const handleFindId = () => {
      if (tableName.value == 'user') {
        router.push({
          name: 'ChangeUserPassword', // 라우트 이름 사용 (선택사항)
          query: { tab: 1 } // 쿼리 파라미터 전달
        })
      } else {
          router.push({
          name: 'ChangeAdminPassword', // 라우트 이름 사용 (선택사항)
          query: { tab: 1 } // 쿼리 파라미터 전달
        })
      }
    };

    const handleChangePassword = () => {
      if (tableName.value == 'user') {
        router.push({
          name: 'ChangeUserPassword', // 라우트 이름 사용 (선택사항)
          query: { tab: 2 } // 쿼리 파라미터 전달
        })
      } else {
          router.push({
          name: 'ChangeAdminPassword', // 라우트 이름 사용 (선택사항)
          query: { tab: 2 } // 쿼리 파라미터 전달
        })
      }
    };

    const handleRegister = () => {
      router.push(url.registeruser);
    };

    const handleSubmit = async () => {
      message.value = '';
      try {
        if (!validateInput(userData.value)) {
          return;
    }

    const response = await axios.post(API.USER_LOGIN, {
      query: userData.value.query,
      password: userData.value.password,
      table: tableName.value,
      queryType: "query",
      }, { withCredentials: true });

      // 로그인 성공 처리
      if (response.status === 200) {
        emit('update-status', { isLoggedIn: true, hasSelectedMatch: false });
        if (tableName.value === 'user') {
          router.push(url.selectvenue);
        } else {
          router.push(url.selectmatch);
        }
      }
    } catch (error) {
      handleError(error)
    }
  };

    const validateInput = (data) => {
      const { query, password } = data;
      if (!query || query.trim() === '') {
        alert('사용자 아이디 또는 전화번호를 입력해 주세요.');
        return false;
      }

      if (!password || password.trim() === '') {
        alert('비밀번호를 입력해 주세요.');
        return false;
      }

      return true;
    };

    const resetSetting = () => {
      userData.value = { query: '', password: '' };
      emit('update-status', { isLoggedIn: false, hasSelectedMatch: false });
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

    const fetchSessionTableName = () => {
      const sessiontableName = sessionStorage.getItem('tableName');
      if (sessiontableName) {
        tableName.value = sessiontableName;
      }
    };

    const fetchSessionUserId = async () => {
      try {
        const response = await axios.get(API.GET_SESSION_USERID, { withCredentials: true });
        if (response.data.status === 200) {
          sessionUserId.value = response.data.userId;
          message.value = `${sessionUserId.value}님은 로그인 상태입니다.`;
        }
        else {
          message.value = `로그인 해주세요.`;
          resetSetting();
        }
      } catch (error) {
        message.value = `로그인 해주세요.`;
        resetSetting();
      }
    };

    onMounted(() => {
      fetchSessionTableName();
      resetSetting();
      fetchSessionUserId();
    });

    return {
      userData,
      sessionUserId,
      message,
      tableName,
      handleSubmit,
      handleFindId,
      handleChangePassword,
      handleRegister,
    };
  }
};
</script>

<style scoped>
/* .common-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.content-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.input-box {
  width: 100%;
}

.input {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  margin-bottom: 15px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ddd;
}

.submit-button {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.submit-button:hover {
  background-color: #45a049;
}

.buttons-containers {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.xsmall-button {
  width: 30%;
  padding: 8px;
  font-size: 12px;
  background-color: #f1f1f1;
  color: black;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
}

.xsmall-button:hover {
  background-color: #ddd;
} */

/* 모바일 뷰 스타일 */
@media (max-width: 600px) {
  .input {
    font-size: 14px;
    padding: 8px;
  }

  .submit-button {
    font-size: 14px;
    padding: 8px;
  }

  .xsmall-button {
    font-size: 10px;
    padding: 5px;
    width: 32%;
  }

  h6 {
    font-size: 18px;
  }
}
</style>
