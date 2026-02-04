# Interactive Stall Selection - Quick Start Guide

## How to Use

### Step 1: Create Stall Types
1. Go to **Event Management** → Click **"Add Event"**
2. Navigate to **"Stall Config"** tab (Step 2)
3. Add stall types by clicking **"+ Add Custom Stall Type"**
4. For each stall type, configure:
   - **Stall Type Name**: e.g., "Basic", "Premium", "VIP"
   - **Price (₹)**: e.g., 25000, 50000, 85000
   - **Number of Stalls**: e.g., 40, 30, 20
   - **Start Number**: Auto-calculated or manual
   - **Stall Color**: Pick a color for visual identification

### Step 2: Open Interactive Selector
Once you have created at least one stall type:
1. Click the blue **"Open Interactive Stall Selection"** button
2. The interactive modal will open

### Step 3: Select Stalls Visually

#### Left Panel - Stall Types
- Shows all your configured stall types
- Each type displays:
  - Color indicator
  - Name and price
  - Progress: "Selected X / Y"
  - Progress bar
- Click a stall type to activate it for selection

#### Right Panel - Stall Grid
- Shows all stalls in a grid layout
- **White stalls** = Unassigned
- **Colored stalls** = Assigned to a stall type
- Stall numbers are displayed in each box

### Step 4: Assign Stalls
1. **Select a stall type** from the left panel (it will highlight)
2. **Click on white stalls** in the grid to assign them
3. The stall will change to the type's color
4. Progress counter updates automatically
5. **Click again** on a colored stall to unassign it

### Step 5: Validation
The system will prevent you from:
- ❌ Selecting more stalls than the limit
- ❌ Selecting stalls already assigned to another type
- ❌ Saving incomplete configurations

### Step 6: Preview (Optional)
- Click **"Preview"** button to see the final layout
- Preview shows:
  - Read-only grid (no editing)
  - Legend with all stall types and prices
  - Dark background for better visibility

### Step 7: Save or Reset
- **Done**: Saves the configuration and closes the modal
- **Reset All**: Clears all assignments (with confirmation)
- **Cancel**: Closes without saving

## Visual Reference

### Stall States
```
┌─────────┐  ┌─────────┐  ┌─────────┐
│    1    │  │    2    │  │    3    │
│ White   │  │  Blue   │  │ Purple  │
│Unassign │  │ Basic   │  │Premium  │
└─────────┘  └─────────┘  └─────────┘
```

### Selection Flow
```
1. Click "Basic" type (blue)
   ↓
2. Click stalls 1, 2, 3 in grid
   ↓
3. Stalls turn blue
   ↓
4. Progress shows "3 / 40"
   ↓
5. Click "Premium" type (purple)
   ↓
6. Click stalls 41, 42, 43
   ↓
7. Stalls turn purple
   ↓
8. Progress shows "3 / 20"
```

## Example Configuration

### Scenario: 100 Stalls Event

**Stall Types:**
1. **Basic** - 40 stalls - ₹25,000 - Blue (#3B82F6)
2. **Standard** - 30 stalls - ₹50,000 - Green (#10B981)
3. **Premium** - 20 stalls - ₹85,000 - Purple (#8B5CF6)
4. **Corner** - 10 stalls - ₹125,000 - Orange (#F97316)

**Assignment Strategy:**
- Basic: Stalls 1-40 (center area)
- Standard: Stalls 41-70 (mid area)
- Premium: Stalls 71-90 (front area)
- Corner: Stalls 91-100 (corner positions)

## Tips & Best Practices

### 1. Plan Your Layout
- Sketch your venue layout first
- Identify premium locations (corners, entrances, main aisles)
- Assign higher-priced types to better locations

### 2. Use Colors Wisely
- Choose distinct colors for easy visual identification
- Use lighter colors for basic types
- Use darker/vibrant colors for premium types

### 3. Efficient Selection
- Select stall types in order (Basic → Premium)
- Complete one type before moving to the next
- Use the progress bar to track completion

### 4. Preview Before Saving
- Always preview the final layout
- Check for any gaps or mistakes
- Verify all types are complete

### 5. Save Regularly
- Save your configuration when complete
- Don't close the modal without saving
- Use "Reset All" only if you want to start over

## Keyboard Shortcuts (Future)
Currently, the interface is mouse/touch-based. Future versions may include:
- Arrow keys to navigate stalls
- Space to select/unselect
- Number keys to switch stall types
- Ctrl+Z for undo

## Troubleshooting

### Issue: Can't select a stall
**Possible reasons:**
- No stall type is selected (select one from left panel)
- Stall is already assigned to another type (unselect it first)
- Limit reached for the selected type (check progress counter)

### Issue: Can't save
**Possible reasons:**
- Not all stall types have the required number of stalls
- Check validation errors shown below the stall types
- Complete all assignments before saving

### Issue: Grid is too small/large
**Solution:**
- The grid auto-adjusts based on total stalls
- For 100 stalls: 10x10 grid
- For 200 stalls: Approximately 14x15 grid
- Scroll if the grid exceeds viewport height

## Data Format

### What Gets Saved
```javascript
{
  totalStalls: 100,
  stallTypes: [
    {
      name: "Basic",
      price: 25000,
      color: "#3B82F6",
      limit: 40
    }
  ],
  assignments: {
    "1": "Basic",
    "2": "Basic",
    "3": "Basic"
    // ... more assignments
  }
}
```

### How It's Used
- **Event Creation**: Saved with the event
- **Exhibitor Booking**: Shows available stalls
- **Pricing**: Determines stall prices
- **Reporting**: Tracks stall occupancy

## Next Steps After Configuration

1. **Complete Event Creation**: Fill in remaining steps (Organizer, Registration, etc.)
2. **Publish Event**: Make it available for exhibitor booking
3. **Share with Exhibitors**: Send registration links
4. **Monitor Bookings**: Track which stalls are booked
5. **Generate Reports**: View stall occupancy and revenue

## Support

For issues or questions:
- Check the validation messages in the interface
- Review this guide
- Contact system administrator
- Check `INTERACTIVE_STALL_SELECTION.md` for technical details
