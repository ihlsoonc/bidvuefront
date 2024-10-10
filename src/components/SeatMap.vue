<template>
  <div>
    <div class="box-container">
      <div>
        <h6 style="text-align: center;">좌석을 선택한 후 입찰 금액을 입력하세요.</h6>
        <div class="box-container">
          <div id="seat-1" class="box"
    :class="{ selected: isSelected(1), bidded: hasBidders(1), selectedbidded: isSelected(1) && hasBidders(1) }"
    @click="handleSeatClick(1)">
    <div class="xsmall">
      1번<br/>{{ getSeatInfo(1).highestBid }}원<br/>{{ getSeatInfo(1).bidCount }}명
    </div>
  </div>

  <div id="seat-2" class="box"
    :class="{ selected: isSelected(2), bidded: hasBidders(2), selectedbidded: isSelected(2) && hasBidders(2) }"
    @click="handleSeatClick(2)">
    <div class="xsmall">
      2번<br/>{{ getSeatInfo(2).highestBid }}원<br/>{{ getSeatInfo(2).bidCount }}명
    </div>
  </div>

  <div id="seat-3" class="box"
    :class="{ selected: isSelected(3), bidded: hasBidders(3), selectedbidded: isSelected(3) && hasBidders(3) }"
    @click="handleSeatClick(3)">
    <div class="xsmall">
      3번<br/>{{ getSeatInfo(3).highestBid }}원<br/>{{ getSeatInfo(3).bidCount }}명
    </div>
  </div>

  <div id="seat-4" class="box"
    :class="{ selected: isSelected(4), bidded: hasBidders(4), selectedbidded: isSelected(4) && hasBidders(4) }"
    @click="handleSeatClick(4)">
    <div class="xsmall">
      4번<br/>{{ getSeatInfo(4).highestBid }}원<br/>{{ getSeatInfo(4).bidCount }}명
    </div>
  </div>

  <div id="seat-5" class="box"
    :class="{ selected: isSelected(5), bidded: hasBidders(5), selectedbidded: isSelected(5) && hasBidders(5) }"
    @click="handleSeatClick(5)">
    <div class="xsmall">
      5번<br/>{{ getSeatInfo(5).highestBid }}원<br/>{{ getSeatInfo(5).bidCount }}명
    </div>
  </div>

  <div id="seat-6" class="box"
    :class="{ selected: isSelected(6), bidded: hasBidders(6), selectedbidded: isSelected(6) && hasBidders(6) }"
    @click="handleSeatClick(6)">
    <div class="xsmall">
      6번<br/>{{ getSeatInfo(6).highestBid }}원<br/>{{ getSeatInfo(6).bidCount }}명
    </div>
  </div>

  <div id="seat-7" class="box"
    :class="{ selected: isSelected(7), bidded: hasBidders(7), selectedbidded: isSelected(7) && hasBidders(7) }"
    @click="handleSeatClick(7)">
    <div class="xsmall">
      7번<br/>{{ getSeatInfo(7).highestBid }}원<br/>{{ getSeatInfo(7).bidCount }}명
    </div>
  </div>

  <div id="seat-8" class="box"
    :class="{ selected: isSelected(8), bidded: hasBidders(8), selectedbidded: isSelected(8) && hasBidders(8) }"
    @click="handleSeatClick(8)">
    <div class="xsmall">
      8번<br/>{{ getSeatInfo(8).highestBid }}원<br/>{{ getSeatInfo(8).bidCount }}명
    </div>
  </div>

  <div id="seat-9" class="box"
    :class="{ selected: isSelected(9), bidded: hasBidders(9), selectedbidded: isSelected(9) && hasBidders(9) }"
    @click="handleSeatClick(9)">
    <div class="xsmall">
      9번<br/>{{ getSeatInfo(9).highestBid }}원<br/>{{ getSeatInfo(9).bidCount }}명
    </div>
  </div>

  <div id="seat-10" class="box"
    :class="{ selected: isSelected(10), bidded: hasBidders(10), selectedbidded: isSelected(10) && hasBidders(10) }"
    @click="handleSeatClick(10)">
    <div class="xsmall">
      10번<br/>{{ getSeatInfo(10).highestBid }}원<br/>{{ getSeatInfo(10).bidCount }}명
    </div>
  </div>

  <div id="seat-11" class="box"
    :class="{ selected: isSelected(11), bidded: hasBidders(11), selectedbidded: isSelected(11) && hasBidders(11) }"
    @click="handleSeatClick(11)">
    <div class="xsmall">
      11번<br/>{{ getSeatInfo(11).highestBid }}원<br/>{{ getSeatInfo(11).bidCount }}명
    </div>
  </div>

  <div id="seat-12" class="box"
    :class="{ selected: isSelected(12), bidded: hasBidders(12), selectedbidded: isSelected(12) && hasBidders(12) }"
    @click="handleSeatClick(12)">
    <div class="xsmall">
      12번<br/>{{ getSeatInfo(12).highestBid }}원<br/>{{ getSeatInfo(12).bidCount }}명
    </div>
  </div>

  <div id="seat-13" class="box"
    :class="{ selected: isSelected(13), bidded: hasBidders(13), selectedbidded: isSelected(13) && hasBidders(13) }"
    @click="handleSeatClick(13)">
    <div class="xsmall">
      13번<br/>{{ getSeatInfo(13).highestBid }}원<br/>{{ getSeatInfo(13).bidCount }}명
    </div>
  </div>

  <div id="seat-14" class="box"
    :class="{ selected: isSelected(14), bidded: hasBidders(14), selectedbidded: isSelected(14) && hasBidders(14) }"
    @click="handleSeatClick(14)">
    <div class="xsmall">
      14번<br/>{{ getSeatInfo(14).highestBid }}원<br/>{{ getSeatInfo(14).bidCount }}명
    </div>
  </div>

  <div id="seat-15" class="box"
    :class="{ selected: isSelected(15), bidded: hasBidders(15), selectedbidded: isSelected(15) && hasBidders(15) }"
    @click="handleSeatClick(15)">
    <div class="xsmall">
      15번<br/>{{ getSeatInfo(15).highestBid }}원<br/>{{ getSeatInfo(15).bidCount }}명
    </div>
  </div>

  <div id="seat-16" class="box"
    :class="{ selected: isSelected(16), bidded: hasBidders(16), selectedbidded: isSelected(16) && hasBidders(16) }"
    @click="handleSeatClick(16)">
    <div class="xsmall">
      16번<br/>{{ getSeatInfo(16).highestBid }}원<br/>{{ getSeatInfo(16).bidCount }}명
    </div>
  </div>

  <div id="seat-17" class="box"
    :class="{ selected: isSelected(17), bidded: hasBidders(17), selectedbidded: isSelected(17) && hasBidders(17) }"
    @click="handleSeatClick(17)">
    <div class="xsmall">
      17번<br/>{{ getSeatInfo(17).highestBid }}원<br/>{{ getSeatInfo(17).bidCount }}명
    </div>
  </div>

  <div id="seat-18" class="box"
    :class="{ selected: isSelected(18), bidded: hasBidders(18), selectedbidded: isSelected(18) && hasBidders(18) }"
    @click="handleSeatClick(18)">
    <div class="xsmall">
      18번<br/>{{ getSeatInfo(18).highestBid }}원<br/>{{ getSeatInfo(18).bidCount }}명
    </div>
  </div>

  <div id="seat-19" class="box"
    :class="{ selected: isSelected(19), bidded: hasBidders(19), selectedbidded: isSelected(19) && hasBidders(19) }"
    @click="handleSeatClick(19)">
    <div class="xsmall">
      19번<br/>{{ getSeatInfo(19).highestBid }}원<br/>{{ getSeatInfo(19).bidCount }}명
    </div>
  </div>

  <div id="seat-20" class="box"
    :class="{ selected: isSelected(20), bidded: hasBidders(20), selectedbidded: isSelected(20) && hasBidders(20) }"
    @click="handleSeatClick(20)">
    <div class="xsmall">
      20번<br/>{{ getSeatInfo(20).highestBid }}원<br/>{{ getSeatInfo(20).bidCount }}명
    </div>
  </div>

  <div id="seat-21" class="box"
    :class="{ selected: isSelected(21), bidded: hasBidders(21), selectedbidded: isSelected(21) && hasBidders(21) }"
    @click="handleSeatClick(21)">
    <div class="xsmall">
      21번<br/>{{ getSeatInfo(21).highestBid }}원<br/>{{ getSeatInfo(21).bidCount }}명
    </div>
  </div>

  <div id="seat-22" class="box"
    :class="{ selected: isSelected(22), bidded: hasBidders(22), selectedbidded: isSelected(22) && hasBidders(22) }"
    @click="handleSeatClick(22)">
    <div class="xsmall">
      22번<br/>{{ getSeatInfo(22).highestBid }}원<br/>{{ getSeatInfo(22).bidCount }}명
    </div>
  </div>

  <div id="seat-23" class="box"
    :class="{ selected: isSelected(23), bidded: hasBidders(23), selectedbidded: isSelected(23) && hasBidders(23) }"
    @click="handleSeatClick(23)">
    <div class="xsmall">
      23번<br/>{{ getSeatInfo(23).highestBid }}원<br/>{{ getSeatInfo(23).bidCount }}명
    </div>
  </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  props: {
    selectedSeats: Array,
    seatBidArray: Array, // 좌석별 입찰 정보를 받을 수 있도록 설정
    disabled: Boolean,
    onSeatClick: {
      type: Function,
      required: true
    }
  },
  methods: {
    handleSeatClick(seatNumber) {
      this.$emit('seat-click', seatNumber);
    },
    isSelected(number) {
      return this.selectedSeats.some(seat => seat.uniqueSeatId === number);
    },
    hasBidders(number) {
      const seat = this.seatBidArray.find(s => s.seat_no == number);
      return seat ? seat.total_bidders > 0 : false;
    },
    getSeatInfo(number) {
      const seat = this.seatBidArray.find(s => s.seat_no == number);
      if (seat) {
        return {
          highestBid: seat.current_bid_amount,
          bidCount: seat.total_bidders
        };
      }
      return { highestBid: 0, bidCount: 0 };
    }
  }
};
</script>

<style scoped>
/* 스타일 정의 */
.empty-cell {
  background-color: white;
  height: 30px;
  width: 60px;
  initial-value: '0';
}

.box-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  max-width: 600px;
  margin: 0 auto;
}

.box {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
}

.box.selected {
  background-color: #9cd3ec;
}

.box.bidded {
  background-color: #8da1ea;
}
.box.selectedbidded {
  background-color: #d2dafa;
}

.box-info {
  margin-top: 20px;
  text-align: center;
}
</style>
