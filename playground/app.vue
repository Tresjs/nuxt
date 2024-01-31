<template>
  <div>
    <NuxtPage />
  </div>
  <div class="menu">
    <div>
      <NuxtLink to="/">
        Home
      </NuxtLink>
    </div>
    <div>
      <NuxtLink to="/page1">
        page1
      </NuxtLink>
    </div>
    <div>
      <NuxtLink to="/page2">
        page2
      </NuxtLink>
    </div>
  </div>
</template>

<style>
.menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3rem;
  color: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
</style>