<template>
    <div id="attribution">
      <p>✨This web page is built for self-learning only. The intention is to apply learning to practice. 🧡 All credit and thanks to <a href="https://github.com/home">the original work</a> by &copy; GitHub, Inc.</p>
    </div>
</template>

<style>
#attribution {
  position: absolute;
  bottom: 0;
  z-index: 5;
  padding: 6px;
  color: #ccc;
  width: 30%;
}
#attribution a {
  text-decoration: underline;
  color: pink;
}
#attribution p {
    line-height: 1.25;
}
@media (max-width: 680px) {
  #attribution {
    width: 24%;
    font-size: 12px;
  }
}
</style>