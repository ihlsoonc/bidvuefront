<template>
  <div class="common-container">
    <br />
    <h5>사용자 조회 및 수정</h5>
    <div class="content-container">
      <div class="input-box">
        <!-- 사용자 조회 폼 -->
        <form @submit.prevent="handleSearch">
          <label>
            사용자 ID 또는 전화번호:
            <input
              type="text"
              v-model="searchQuery"
              class="input"
              placeholder="사용자 ID 또는 전화번호 입력"
            />
          </label>
          <div class="messagebox">{{ passwordMsg }}</div>
          <label>
            비밀번호:
            <input
              type="password"
              v-model="password"
              class="input"
              placeholder="비밀번호 입력"
            />
          </label>
          <button class="submit-button" type="submit">조회</button>
        </form>

        <!-- 사용자 정보 수정 폼 -->

        <div v-if="canUpdate && userData">
          <form @submit.prevent="handleUpdate">
            <label>
              사용자 ID:
              <input
                type="text"
                v-model="userData.userid"
                class="input"
                readonly
              />
            </label>
            <label>
              사용자 이름:
              <input
                type="text"
                v-model="userData.username"
                class="input"
                placeholder="사용자 이름 수정"
              />
            </label>
            <label>
              이메일:
              <input
                type="email"
                v-model="userData.email"
                class="input"
                placeholder="이메일 수정"
                @change="handleEmailChange"
              />
              <button @click="handleEmailCheck" type="button">이메일 유효 확인</button> <!-- 이메일 확인 버튼 -->
            </label>
            <label>
              전화번호:
              <input
                type="text"
                v-model="userData.telno"
                class="input"
                placeholder="전화번호 수정"
                min="1"
              />
            </label>
            <label>
              우편번호:
              <input
                type="text"
                v-model="userData.postcode"
                class="input"
                placeholder="우편번호 수정"
               minlength="5" maxlength="5"
              />
            </label>
            <label>
              주소:
              <input
                type="text"
                v-model="userData.addr1"
                class="input"
                placeholder="주소 수정"
              />
            </label>
            <label>
              상세 주소:
              <input
                type="text"
                v-model="userData.addr2"
                class="input"
                placeholder="상세 주소 수정"
              />
            </label>
            <label>
          사용자 타입:
          <select
            v-model="userData.userType"
            class="input"
            autocomplete="off" 
            :disabled="hasSubmitted"
          >
            <option v-for="(label, key) in ADMIN_TYPES" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
        </label>
            <br />
            <button class="submit-button" type="submit">수정 내용 제출</button>
            <button type="reset" @click="handleReset">취소</button>
          </form>
        </div>
        <div class="messagebox">{{ message }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import { API, messageCommon, ADMIN_TYPES } from "../utils/messagesAPIs";
  const searchQuery = ref(""); // 검색어 (사용자 ID 또는 전화번호)
  const password = ref(""); // 비밀번호
  const tableName = ref(""); 
  
  const canUpdate = ref(false);
  const validEmail = ref(true);
  const userData = ref(null); // 조회된 사용자 정보
  const passwordMsg = ref(""); // 메시지
  const message = ref(""); // 메시지

  // 사용자 정보 조회 함수
  const handleSearch = async () => {
    try {
      const response = await axios.post(API.GET_ADMIN_INFO, 
        {
          query: searchQuery.value,
          password: password.value, // 비밀번호도 함께 전송
          requestType :"query",
          table :tableName.value,
        },
      );

      if (response.status === 200 && response.data) {
        userData.value = response.data; // 조회된 사용자 정보 저장
        passwordMsg.value ='';
        message.value = "사용자 정보가 조회되었습니다.";
        canUpdate.value = true;
      }
    } catch (error) {
      handleError(error);
    }
  };

  // 사용자 정보 수정 함수
  const handleUpdate = async () => {
    // console.log("사용자",userData.value.postCode);
    // console.log("사용자2",userData.value);
    if (!validateInput(userData)) {
      return;
    }
    try {
      const response = await axios.post(API.UPDATE_ADMIN, {
      ...userData.value,   // userData의 모든 값들을 펼쳐서 전송
      table: tableName.value  // tableName을 본문에 포함
    });

    if (response.status === 200) {
      message.value = "사용자 정보가 성공적으로 수정되었습니다.";
      canUpdate.value = false;
    }
    } catch (error) {
      handleError(error);
    }
  };
  const handleEmailChange = async () => {
    validEmail.value = false;
  }
  const handleEmailCheck = async () => {
    if (!userData.value.email)
      {alert("이메일을 입력해 주세요.");
      return;}
    const email = userData.value.email.trim()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 이메일 형식 정규식
    if (!emailPattern.test(email)) {
      alert("유효한 이메일 형식을 입력해 주세요.");
      return;
    }
    // 필요한 경우 서버 이메일 체크루틴 추가
    // try {
    //   const response = await axios.post(API.CHECK_EMAIL, { email });
    //   if (response.status === 200 && response.data.valid) {
    //     message.value = "유효한 이메일입니다.";
    //     validEmail.value = true;
    //   } else {
    //     message.value = "이메일 확인에 실패했습니다.";
    //     validEmail.value = false;
    //   }
    // } catch (error) {
    //   handleError(error);
    // }
  }


  const validateInput = (userData) => {
      const {username, email, telno, postcode} = userData.value;
      // if (!userId || userId.trim() === "") {
      //   alert("사용자 Id를 입력해 주세요.");
      //   return false;
      // }

      if (!username || username.trim() === "") {
        alert("사용자 이름을 입력해 주세요.");
        return false;
      }

      if (!telno ) {
          alert("전화번호를 입력해 주세요.");
          return false;
      }

      const telnoPattern = /^\d{10,11}$/; // 10자리 또는 11자리 숫자

      if (!telnoPattern.test(telno)) {
        alert("전화번호는 10자리 또는 11자리 숫자여야 합니다.");
        return false;
      }

      if (!email || email.trim() === "") {
          alert("이메일을 입력해 주세요.");
          return false;
        }
      if (!validEmail.value) {
        alert("이메일 유효 확인을 해주세요.");
        return false; 
      }
      const trimmedEmail = email.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 기본적인 이메일 형식 정규 표현식

      if (!emailPattern.test(trimmedEmail)) {
        alert("유효한 이메일 형식을 입력해 주세요.");
        return false;

      }
      if (postcode && postcode.trim() !== "") {
          const postcodePattern = /^\d{5}$/; // 5자리 숫자
          if (!postcodePattern.test(postcode)) {
            alert("우편번호는 5자리 숫자여야 합니다.");
            return false;
          }
        }
      return true;
      };

  const handleReset = () => {
    canUpdate.value = false;
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
    password.value = ''; // 비밀번호를 빈 값으로 설정
    passwordMsg.value ='사용자 정보 수정을 위해 비밀번호를 입력해주세요.';
  });

</script>

<style scoped>
/* 여기에 CSS를 추가하세요 */
</style>
