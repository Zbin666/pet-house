<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			try {
				const info = uni.getSystemInfoSync()
				const h = (info && info.statusBarHeight) ? info.statusBarHeight : 0
				const root = document && (document.documentElement || document.body)
				if (root) root.style.setProperty('--status-bar-height', h + 'px')
			} catch (e) {}
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
