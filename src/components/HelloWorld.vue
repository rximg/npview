<template>
  <div class="hello">
    <textarea v-model="formula" cols="30" rows="10"></textarea>
    <VueMathjax :formula="formula" :safe="false"></VueMathjax>
    <!-- {{formula}} -->
  </div>
</template>

<script setup lang="ts">
import VueMathjax from 'vue-mathjax-next';
import {ref} from 'vue'

const formula = ref('\[\texttt{dst} (x,y) = \min _{(x,y): \, \texttt{element} (x,y) \ne0 } \texttt{src} (x+x,y+y)\]')
//'<button>dfgtest</button> $$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.$$'
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
