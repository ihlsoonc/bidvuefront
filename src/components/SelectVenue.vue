<template>
    <div class="venue-container">
      <h5>경기장 선택</h5>
  
      <!-- 서버에서 데이터를 받아온 후 리스트로 보여주기 -->
      <ul v-if="venueArray && venueArray.length > 0">
      <li v-for="(venue, index) in venueArray" :key="venue.venue_cd">
        <button @click="selectVenue(index)" 
                :class="{ selected: selectedVenueIndex === index }">
          {{ venue.venue_name }}
        </button>
        <img :src="`/images/venues/${venue.venue_img_file}`" 
        @click="selectVenue(index)"
        :alt="venue.venue_name" class="venue-image-small" />
      </li>
    </ul>
</div>

  </template>
  
  <script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { API, url, messageCommon} from '../utils/messagesAPIs';
import axios from 'axios';

export default {
  setup() {
    const router = useRouter();
    const venueArray = ref([]);
    const selectedVenueCd = ref('');
    const selectedVenueIndex = ref(null);
    const message = ref('');

    // 서버에서 데이터 가져오기
    const fetchVenues = async () => {
      try {
        const response = await axios.get(API.GET_ALL_VENUES); // 서버에서 경기장 데이터를 읽어옴
        venueArray.value = response.data;  // 예: [{venue_cd: '001', venue_name: '서울 경기장', venue_img_file: 'path_to_image/seoul.jpg'}, ...]
     
    } catch (error) {
        handleError(error);
      }
    };

    // 페이지가 로드될 때 서버로부터 경기장 데이터를 받아옴
    onMounted(() => {
      fetchVenues();
    });

    // 경기장 선택 처리
    const selectVenue = (index) => {
    const venue = venueArray.value[index];
    selectedVenueCd.value = venue.venue_cd;
    sessionStorage.setItem('venueNumber', selectedVenueCd.value);
    router.push(url.selectmatchuser);
    };

    // 선택한 경기장 데이터 계산
    const selectedVenue = computed(() => {
      return selectedVenueIndex.value !== null ? venueArray.value[selectedVenueIndex.value] : null;
    });

    const handleError = (error) => {
      if (error.response) {
        message.value = error.response.data;
      } else if (error.request) {
        message.value = messageCommon.ERR_NETWORK;
      } else {
        message.value = messageCommon.ERR_ETC;
      }
    }

    return {
      venueArray,
      selectedVenueIndex,
      selectVenue,
      selectedVenue,
      message,
    };
  },
};
</script>

  <style scoped>
  .venue-container {
    text-align: center;
    flex-direction: column;
  }
  
  .venue-image {
    max-width: 100%px;
    height: auto;
    margin-top: 20px;
  }
  
  ul {
    list-style-type: none;
    padding: 0;
  }
  
  li {
    display: inline-block;
    margin: 10px;
  }
  
  button {
    padding: 10px;
    font-size: 16px;
    border: none;
    cursor: pointer;
    background-color: white;
    border-radius: 5px;
  }
  
  button.selected {
    background-color: blue;
    color: white;
  }
  
  button:hover {
    background-color:white;
    cursor:point;
  }
  </style>
  
  