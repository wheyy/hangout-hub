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

4. Implemented Comprehensive Filter System for Hangout Drawer
- **File: `components/map/hangout-drawer.tsx`**
    - **Added filter state management:**
        - `priceRange` - Array of selected price levels (0-4: Free to Very Expensive)
        - `rating` - Array of selected minimum ratings (3.0, 3.5, 4.0, 4.5+)
        - `operatingHours` - String filter ("all", "openNow", "closedNow")
        - `placeType` - Array of selected place categories
    
    - **Implemented filter dropdown UI:**
        - Filter icon button in header next to hangout spot title
        - Dropdown positioned from left edge (left-0)
        - Four filter sections with clear labels
        - **Price Range:** Multi-select checkboxes for $ to $$$$
        - **Rating:** Multi-select buttons for 3.0+ to 4.5+ ratings
        - **Operating Hours:** Radio buttons for All/Open Now/Closed Now
        - **Type of Places:** Multi-select checkboxes for 12 categories
    
    - **Enhanced place type categories (expanded from 6 to 12):**
        - restaurant, cafe, bar
        - shopping_mall, tourist_attraction, park
        - museum, art_gallery, night_club
        - movie_theater, bowling_alley, amusement_park
        - Displays as Title Case (e.g., "shopping_mall" → "Shopping Mall")
    
    - **Added click-outside handler:**
        - Detects clicks outside dropdown to auto-close
        - Excludes clicks within drawer using `data-drawer="hangout"` attribute
        - Prevents dropdown from closing when clicking filter button
        - Uses useRef and useEffect for event handling
    
    - **Implemented real-time filtering logic:**
        - `filteredHangoutSpots` - Filters based on all active filters
        - Price filter checks if spot's priceLevel is in selected range
        - Rating filter checks if spot's rating >= any selected minimum
        - Operating hours filter checks isOpenNow status
        - Place type filter checks if spot's category matches selections
        - Empty state message: "No hangout spots match the selected filters"
    
    - **Fixed scrollbar positioning:**
        - Container uses `direction: 'rtl'` for left-side scrollbar
        - Content uses `direction: 'ltr'` to restore normal text flow
        - Scrollbar appears on inner edge (right side of left drawer)
        - Prevents scrollbar from being hidden under dropdown

5. Implemented Availability Filter System for Parking Drawer
- **File: `components/map/parking-drawer.tsx`**
    - **Added filter state management:**
        - `selectedColors` - Array of selected availability colors (green, amber, red)
    
    - **Implemented availability color calculation:**
        - `getAvailabilityColorCategory()` - Determines color based on percentage
        - **Green:** ≥50% available lots
        - **Amber:** 20-49% available lots
        - **Red:** <20% available lots
    
    - **Implemented filter dropdown UI:**
        - Filter icon button in header next to parking title
        - Dropdown positioned from right edge (right-0)
        - Three color options with visual indicators:
            - Green circle with "High availability (≥50%)"
            - Amber circle with "Medium availability (20-49%)"
            - Red circle with "Low availability (<20%)"
        - Multi-select checkboxes for each color category
    
    - **Added click-outside handler:**
        - Same pattern as hangout drawer
        - Uses `data-drawer="parking"` attribute for exclusion
        - Allows both drawers' dropdowns to be open simultaneously
    
    - **Implemented real-time filtering logic:**
        - `filteredCarparks` - Filters based on selected availability colors
        - Calculates color category for each carpark
        - Shows carparks matching any selected color
        - Empty state message: "No carparks match the selected availability filters"
    
    - **Fixed scrollbar positioning:**
        - Container uses `direction: 'rtl'` for left-side scrollbar
        - Content uses `direction: 'ltr'` to restore normal text flow
        - Scrollbar appears on inner edge (left side of right drawer)

6. Fixed Google Places API Price Level Conversion
- **File: `app/api/places/nearby/route.ts`**
    - **Problem:** Google Places API (New) returns `priceLevel` as string enum instead of number
    - **Solution:** Added conversion switch statement:
        ```typescript
        let priceLevelNum = 0;
        switch (place.priceLevel) {
          case 'PRICE_LEVEL_FREE': priceLevelNum = 0; break;
          case 'PRICE_LEVEL_INEXPENSIVE': priceLevelNum = 1; break;
          case 'PRICE_LEVEL_MODERATE': priceLevelNum = 2; break;
          case 'PRICE_LEVEL_EXPENSIVE': priceLevelNum = 3; break;
          case 'PRICE_LEVEL_VERY_EXPENSIVE': priceLevelNum = 4; break;
        }
        ```
    - **Result:** Price levels now correctly display as $, $$, $$$, $$$$

- **File: `app/api/places/details/route.ts`**
    - Applied same price level enum-to-number conversion logic
    - Ensures consistency between nearby search and detail view

7. Enhanced UI Layout and Interactions
- **Hangout Drawer Layout Changes:**
    - Moved "Hangout Spot" title to left side of header
    - Positioned filter icon at right side (where title used to be)
    - Improved header spacing and alignment
    - Filter dropdown doesn't interfere with scroll area

- **Parking Drawer Layout Changes:**
    - Maintained consistent header layout with hangout drawer
    - Filter icon positioned at right side
    - Proper spacing between title and filter button

- **Simultaneous Dropdown Behavior:**
    - Both drawers can have filter dropdowns open at same time
    - Click-outside handlers use `data-drawer` attributes to prevent cross-interference
    - Each dropdown only closes when clicking outside its own drawer

- **Scrollbar Visual Improvements:**
    - Visible on hover with smooth transitions
    - Positioned on inside edges (between drawers and map)
    - Thumb appears larger and more visible
    - Prevents content from being hidden under dropdowns

8. Filter UI Refinements
- **Spacing and Layout:**
    - Reduced gaps in rating button grid (`gap-1.5`)
    - Adjusted padding for better fit (`px-1` for rating buttons)
    - Consistent spacing between filter sections
    - Proper padding in dropdown containers

- **Visual Design:**
    - Clear section labels with bottom borders
    - Checkbox and button states with proper hover/active colors
    - Color indicators for parking availability (filled circles)
    - Responsive button sizing for different content lengths

- **Accessibility:**
    - Clear labels for all filter options
    - Visual feedback on hover and selection
    - Consistent interaction patterns across both drawers
    - Empty state messages when no results match filters

