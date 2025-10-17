1. Fixed the shopping_mall to Shopping Mall
- **File: `lib/services/google-places.ts`**
    - Added `humanizeSnakeCase()` function to convert snake_case category names to Title Case
        - Converts underscores to spaces
        - Capitalizes first letter of each word
        - Example: "shopping_mall" → "Shopping Mall"
    - Updated `convertToHangoutSpot()` function:
        - Added `categorySlug` constant to store the raw category type
        - Changed `category` to `categoryLabel` for better clarity
        - Now displays human-readable category names instead of snake_case

2. Fixed Operating Hours Display
- **File: `app/api/places/details/route.ts`**
    - Added `regularOpeningHours` to the X-Goog-FieldMask to request opening hours data from Google Places API
    - Updated response to include both `current_opening_hours` and `regular_opening_hours` fields
    - Added fallback logic: `opening_hours: data.currentOpeningHours || data.regularOpeningHours`

- **File: `app/api/places/nearby/route.ts`**
    - Added `places.regularOpeningHours` to the X-Goog-FieldMask for nearby search requests
    - Updated the places mapping to include both `current_opening_hours` and `regular_opening_hours`
    - Added fallback logic for opening hours data

- **File: `lib/services/google-places.ts`**
    - **Enhanced `parseOpeningHours()` function:**
        - Added support for `regularOpeningHours` field
        - Added support for `weekdayDescriptions` field (new Google API format)
        - Enhanced time parsing to handle both string format (`"HHMM"`) and object format (`{hour, minute}`)
        - Moved `push` helper function outside the loop to fix scoping issue
        - Added support for 24/7 places (no close time)
        - Better error handling for missing data
    
    - **Added new helper functions:**
        - `formatTime24()` - Converts minutes since midnight to 24-hour format (HH:MM)
        - `convertTo24Hour()` - Converts 12-hour time strings to 24-hour format
        - `convert12to24()` - Converts individual 12-hour times to 24-hour format
        - Enhanced `getTodayHoursText()` to:
            - Prioritize `weekdayText` as it's more reliable
            - Automatically convert 12-hour format to 24-hour format
            - Handle "Closed" days properly
            - Return empty string for closed days instead of "Closed" text
    
    - **Updated opening hours display logic in `convertToHangoutSpot()`:**
        - "Hours not available" - when no opening hours data exists
        - "Open now" - when place is currently open
        - "Closed - HH:MM - HH:MM" - when closed, showing today's hours in 24-hour format
        - "Closed" - when closed today with no hours available

- **Key improvements:**
    - Now properly fetches opening hours from Google Places API (New)
    - Handles multiple time formats (12-hour with AM/PM, 24-hour, object format)
    - Supports places with split shifts (e.g., "09:00 - 12:00, 14:00 - 22:00")
    - Better handling of edge cases (24/7 places, closed days, missing data)
    - Automatic conversion to 24-hour format for consistency
    - Works with both `currentOpeningHours` and `regularOpeningHours` fields

3. Implemented Singapore Boundary-Based Search Restrictions
- **File: lib/services/google-places.ts**
    - **Added boundary validation functions:**
        - loadSingaporeBoundary() - Loads and caches SubZoneBoundary.geojson file
        - pointInPolygon() - Custom Ray Casting algorithm for point-in-polygon detection
        - isPointInSingapore() - Checks if coordinates fall within any Singapore subzone polygon
        - isInSingapore() - Main async validation function with fallback to bounding box (1.15-1.50�N, 103.6-104.05�E)
    
    - **Updated search methods:**
        - nearbySearch() - Validates search center against GeoJSON boundaries before fetching
        - searchNearbyInArea() - Validates search center against GeoJSON boundaries before fetching
        - Both methods filter returned spots to ensure they're within Singapore boundaries
        - Throws error: "Search is outside the boundary" if location is invalid

- **File: app/api/places/search/route.ts**
    - **Added server-side boundary validation:**
        - Implemented same point-in-polygon functions for server-side validation
        - loadSingaporeBoundary() - Loads GeoJSON from file system using Node.js fs module
        - Validates search results against SubZoneBoundary.geojson
        - Rejects results outside Singapore with 404 error
        - Fallback to bounding box if GeoJSON fails to load

- **File: app/api/places/autocomplete/route.ts**
    - Maintained 25km radius for locationBias to focus on Singapore
    - Kept includedRegionCodes: ["SG"] restriction
    - Added languageCode: "en" for consistent English results

- **File: app/page.tsx**
    - **Added client-side boundary validation:**
        - Imported point-in-polygon validation functions
        - loadSingaporeBoundary() - Fetches GeoJSON via HTTP for client-side use
        - Updated handleSearchPinDragEnd() to be async
        - Validates pin location when user drags search pin
        - Shows error message: "Search is outside the boundary" if pin dragged outside
        - Prevents search execution for invalid locations
        - Fallback to bounding box if GeoJSON fails to load

- **File: lib/map/maplibre-map.ts**
    - Removed maxBounds restriction to allow free map panning
    - Users can now view neighboring regions for context
    - No visual boundary overlay (clean map view)

- **Key features:**
    - **Accurate boundary detection** using SubZoneBoundary.geojson (Singapore subzones)
    - **Custom point-in-polygon algorithm** (Ray Casting method, no external dependencies)
    - **Multi-layer validation:** Client-side, service layer, and server-side
    - **Graceful fallback** to bounding box if GeoJSON loading fails
    - **Free map navigation** while maintaining search restrictions
    - **Clear error messages:** "Search is outside the boundary"
    - **Performance optimized** with boundary data caching
