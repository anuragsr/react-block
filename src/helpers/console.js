export default {
  log: () => {
    return console.log.bind(window.console)
  }
}