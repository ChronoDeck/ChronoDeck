coords = [
            {
                "id": 2,
                "x": 7.655669212341309,
                "y": 41.332393646240234
            },
            {
                "id": 3,
                "x": -88.5768814086914,
                "y": 5.030056476593018
            },
            {
                "id": 4,
                "x": 43.02452087402344,
                "y": 15.875656127929688
            },
            {
                "id": 5,
                "x": -8.795692443847656,
                "y": -31.54520034790039
            },
            {
                "id": 6,
                "x": 30.124975204467773,
                "y": -27.855117797851562
            },
            {
                "id": 7,
                "x": -81.17699432373047,
                "y": 35.66664505004883
            },
            {
                "id": 8,
                "x": 71.97077941894531,
                "y": -20.383970260620117
            },
            {
                "id": 9,
                "x": 3.271594524383545,
                "y": 3.4952340126037598
            }
        ]

def calculate_distance(p1, p2):
    return ((p1['x'] - p2['x'])**2 + (p1['y'] - p2['y'])**2)**0.5

# Find point with id=5
point_6 = next(point for point in coords if point['id'] == 6)

# Calculate distances and sort
distances = [(point['id'], calculate_distance(point, point_6)) for point in coords]
print(distances)
sorted_distances = sorted(distances, key=lambda x: x[1])

# Create the final sorted list of IDs
sorted_ids = [id for id, _ in sorted_distances]

print(sorted_ids)  # This will print the IDs ordered by distance from point 5

