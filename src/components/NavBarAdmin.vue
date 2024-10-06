<template>
  <nav class="navbar navbar-expand-lg bg-primary-subtle">
    <div class="container-fluid">
      <a class="navbar-brand" href="#" src="img1.JPG">대회관리</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="nav-link" @click="handleClick('adminlogin')">홈</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" @click="handleClick('selectmatch')" :class="{ 'disabled': !isLoggedIn }">대회선택</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" @click="handleClick('bidresults')" :class="{ 'disabled': !isLoggedIn || !hasSelectedMatch }">입찰현황 및 낙찰진행</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" @click="handleClick('managematch')" :class="{ 'disabled': !isLoggedIn }">대회관리</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" @click="handleClick('approvematch')" :class="{ 'disabled': !isLoggedIn }">대회승인</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" @click="handleClick('updateseatprice')" :class="{ 'disabled': !isLoggedIn || !hasSelectedMatch }">좌석가격입력</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" @click="handleClick('managevenue')" :class="{ 'disabled': !isLoggedIn }">경기장관리</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" @click="handleClick('updateadmin')" :class="{ 'disabled': !isLoggedIn }">마이메뉴</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" @click="handleClick('adminlogout')" :class="{ 'disabled': !isLoggedIn }">로그아웃</a>
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
      // isLoggedIn,
      // hasSelectedMatch,
      handleClick
    };
  }
};
</script>

<style scoped>
/* 추가 스타일을 원하면 여기에 작성 */
</style>
