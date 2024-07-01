<script>
    // Add any necessary JavaScript here
</script>

<main class="min-h-screen flex flex-col h-full mx-auto">
    <header class="variant-filled shadow w-full sm:px-6 sm:py-4 px-3 py-3">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-800">Volunteer Management Platform</h1>
        </div>
    </header>

    <section class="flex-1 flex flex-col justify-center items-center text-center mt-12">
        <div class="max-w-2xl">
            <h2 class="text-4xl font-bold mb-4">Welcome to VMP</h2>
            <p class="mb-8">
                Connecting Volunteers with Organizations for a Better Tomorrow
            </p>
            <div class="flex justify-center mb-4">
                <a href="/auth/signin/volunteer" class="btn variant-filled-primary px-4 py-2 mx-2">Login as Volunteer</a>
                <a href="/auth/signin/organization" class="btn variant-filled-secondary px-4 py-2 mx-2">Login as Organization</a>
            </div>
            <div class="flex justify-center">
                <a href="/auth/signup/volunteer" class="btn variant-filled-primary px-4 py-2 mx-2">Sign Up as Volunteer</a>
                <a href="/auth/signup/organization" class="btn variant-filled-secondary px-4 py-2 mx-2">Sign Up as Organization</a>
            </div>
        </div>
    </section>

    <footer class="variant-filled w-full py-6 sm:px-6 px-3">
        <div class="text-center text-gray-600">
            &copy; 2024 Volunteer Management Platform. All rights reserved.
        </div>
    </footer>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
    }
</style>
