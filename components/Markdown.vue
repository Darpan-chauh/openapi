<template>
    <div v-html="compiledMarkdown"></div>
  </template>
  
  <script>
  import { marked } from 'marked';
  
  export default {
    props: ['markdown'],
    computed: {
      compiledMarkdown() {
        return marked(this.markdown, { gfm: true });
      },
    },
  };
  </script>
  