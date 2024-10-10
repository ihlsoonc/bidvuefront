<template>
  <nav>
    <div>
      <div id="navbarSupportedContent">
        <ul class="rowflex-container">
          <li>
            <a @click="handleClick('adminlogin')">로그인</a>
          </li>
          <li>
            <a @click="handleClick('selectmatch')" :class="{ 'disabled': !isLoggedIn }">대회선택</a>
          </li>
          <li>
            <a @click="handleClick('bidresults')" :class="{ 'disabled': !isLoggedIn || !hasSelectedMatch }">입찰현황 및 낙찰진행</a>
          </li>
          <li>
            <a @click="handleClick('managematch')" :class="{ 'disabled': !isLoggedIn }">대회관리</a>
          </li>
          <li>
            <a @click="handleClick('approvematch')" :class="{ 'disabled': !isLoggedIn }">대회승인</a>
          </li>
          <li>
            <a @click="handleClick('updateseatprice')" :class="{ 'disabled': !isLoggedIn || !hasSelectedMatch }">좌석가격입력</a>
          </li>
          <li>
            <a @click="handleClick('managevenue')" :class="{ 'disabled': !isLoggedIn }">경기장관리</a>
          </li>
          <li>
            <a @click="handleClick('updateadmin')" :class="{ 'disabled': !isLoggedIn }">사용자정보수정</a>
          </li>
          <li>
            <a @click="handleClick('adminlogout')" :class="{ 'disabled': !isLoggedIn }">로그아웃</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, watch, onMounted } from 'vue';

export default {
  name: 'NavBarAdmin',
  props: {
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
    hasSelectedMatch: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const isLoggedIn = ref(props.isLoggedIn);
    const hasSelectedMatch = ref(props.hasSelectedMatch);

    const handleClick = (action) => {
      emit('link-action', action);
    };

    const updateStatus = () => {
      isLoggedIn.value =  props.isLoggedIn;
      hasSelectedMatch.value = props.hasSelectedMatch ;
    };

    watch([() => props.isLoggedIn, () => props.hasSelectedMatch], () => {
      updateStatus();
    });

    onMounted(() => {
      updateStatus();
    });

    return {
      handleClick
    };
  }
};
</script>

<style scoped>
/* 추가 스타일을 원하면 여기에 작성 */
</style>
