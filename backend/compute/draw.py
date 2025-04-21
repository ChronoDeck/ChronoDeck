import matplotlib
matplotlib.use('Agg')  # Set the backend to non-interactive before importing pyplot
import matplotlib.pyplot as plt
import numpy as np
import os

def draw_tsne(points):
    """
    Draw t-SNE visualization
    Args:
        points: list of dictionaries containing 'id', 'x', and 'y' coordinates
    Returns:
        path to saved plot
    """
    if len(points) ==8:
        # Convert points to numpy array for easier plotting
        data_to2d = np.array([[p['x'], p['y']] for p in points])
        
        plt.figure(figsize=(8, 8))
        plt.scatter(data_to2d[:, 0], data_to2d[:, 1])
        
        # Set axis limits based on data range with some padding
        x_min, x_max = data_to2d[:, 0].min(), data_to2d[:, 0].max()
        y_min, y_max = data_to2d[:, 1].min(), data_to2d[:, 1].max()
        padding = 0.05  # 5% padding
        x_range = x_max - x_min
        y_range = y_max - y_min
        plt.xlim(x_min - padding * x_range, x_max + padding * x_range)
        plt.ylim(y_min - padding * y_range, y_max + padding * y_range)
        
        # Add grid and zero lines
        plt.grid(True)
        plt.axhline(y=0, color='k', linestyle='-', linewidth=0.5)
        plt.axvline(x=0, color='k', linestyle='-', linewidth=0.5)
        
        plt.title('t-SNE Visualization')
        
        # Save the plot in the compute folder
        output_path = os.path.join(os.path.dirname(__file__), 'tsne_plot.png')
        plt.savefig(output_path)
        plt.close()
        
        return output_path
    
