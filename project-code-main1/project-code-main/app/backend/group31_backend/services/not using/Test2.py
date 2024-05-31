def expand_years(year_ranges):
    expanded_years = []
    for year_range in year_ranges:
        # Check if year_range is just "-" or if it's not a valid range
        if year_range == "-" or not year_range.replace("-", "").isdigit():
            continue  # Skip this iteration if the range is invalid
        
        # Attempt to split the range and convert to integers
        try:
            start_year, end_year = map(int, year_range.split('-'))
            expanded_years.extend(range(start_year, end_year + 1))
        except ValueError:
            # Handle cases where conversion to int fails or range is improperly formatted
            print(f"Skipping invalid range: {year_range}")
            continue
        
    return expanded_years

# Example usage with a potentially problematic list
years_played = [ "-"]

# Transforming the 'years_played' list into a list of all years played
expanded_years_played = expand_years(years_played)

print(expanded_years_played)
