# QA: Home Page CTAs

Scope: Verify that "Get Started" and "Explore" buttons on the Home page trigger navigation.

Steps:
1. Open Home page (/).
2. Click "Get Started"
   - Expect navigation to /signup.
3. Click "Explore" with feature flag exploreV2 disabled
   - Set localStorage flag: FEATURE_FLAGS={"exploreV2":false}
   - Refresh and click "Explore"
   - Expect navigation to /feed.
4. Click "Explore" with exploreV2 enabled
   - Set localStorage flag: FEATURE_FLAGS={"exploreV2":true}
   - Refresh and click "Explore"
   - Expect navigation to /dashboard.

Notes:
- TopNav has z-index 30 and position: sticky; Home CTAs are within Card in content area and should be clickable.
- Button has type="button" by default to avoid form submit side-effects.
