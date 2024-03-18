<script lang="ts">
	import about_text from '$lib/about_text';
</script>

<div class="m-auto justify-center w-2/3 h-full mt-20">
	<h1>About</h1>
	{#each about_text.split('\n') as line}
		<br />
		<p>{line}</p>
	{/each}
	<br />
	<h1>Privacy Policy</h1>
	<p class="text-sm">Effective Date: March 14, 2024</p>
	<br />
	<h2>Introduction</h2>
	<p class="indent">
		Our website (chatfrc.app) is committed to protecting your privacy. This Privacy Policy outlines
		how we collect, use, disclose, and safeguard your information.
	</p>
	<h2>Information Collection</h2>
	<p class="indent">
		We collect information through Google Analytics to understand our educational impact, queries
		about robotics, and through forms when you sign up as a user. This includes but is not limited
		to your IP address, the pages you visit on our site, and any information you provide in forms.
	</p>
	<h2>Use of Information</h2>
	<p class="indent">
		Your information is used to gauge our educational impact and improve our content.
	</p>
	<h2>Information Sharing and Disclosure</h2>
	<p class="indent">
		We do not share your personal information with third parties, except as required by law or to
		protect our rights.
	</p>
	<h2>Data Security</h2>
	<p class="indent">
		We take reasonable measures to protect your information from unauthorized access, alteration, or
		destruction.
	</p>
	<h2>Cookies and Tracking Technologies</h2>
	<p class="indent">
		We use cookies and similar tracking technologies to track activity on our websites and hold
		certain information. You can instruct your browser to refuse all cookies or to indicate when a
		cookie is being sent.
	</p>
	<h2>Your Rights</h2>
	<p class="indent">
		California residents have specific rights regarding their personal information under the
		California Consumer Privacy Act (CCPA).
	</p>
	<h2>Changes to This Privacy Policy</h2>
	<p class="indent">
		We may update our Privacy Policy from time to time. We will notify you of any changes by posting
		the new Privacy Policy on this page.
	</p>
	<h2>Contact Us</h2>
	<p class="indent">If you have any questions about this Privacy Policy, please contact us.</p>
</div>

<style lang="postcss">
	h1 {
		@apply text-3xl font-bold;
	}
	h2 {
		@apply font-bold text-xl;
	}
	.indent {
		@apply ml-8;
	}
</style>
