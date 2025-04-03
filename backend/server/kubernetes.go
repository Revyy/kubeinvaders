package server

import (
	"context"
	"errors"
	"fmt"
	"os"

	"go.uber.org/zap"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	apiWatch "k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/cache"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/tools/watch"
)

func getConfig(configPath string, logger *zap.Logger) (*rest.Config, error) {
	if _, err := os.Stat(configPath); errors.Is(err, os.ErrNotExist) {
		logger.Info("no config file found, using in-cluster config")

		config, err := rest.InClusterConfig()
		if err != nil {
			return nil, fmt.Errorf("failed to build in-cluster config: %w", err)
		}

		return config, nil
	}

	logger.Info("using local config file", zap.String("configPath", configPath))

	config, err := clientcmd.BuildConfigFromFlags("", configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to build local config: %w", err)
	}

	return config, nil
}

func newClientSet(config *rest.Config) (*kubernetes.Clientset, error) {
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, fmt.Errorf("failed to create Kubernetes clientset: %w", err)
	}

	return clientset, nil
}

// List all pods in a cluster
func listAllPods(ctx context.Context, clientset *kubernetes.Clientset) (*v1.PodList, error) {
	pods, err := clientset.CoreV1().Pods("").List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list pods: %w", err)
	}

	return pods, nil
}

func setupWatcher(ctx context.Context, clientSet *kubernetes.Clientset, timeout *int64, resourceVersion string) (*watch.RetryWatcher, error) {
	// The watcher will restart when it times out after timeout seconds.
	watchFunc := func(ctx context.Context, options metav1.ListOptions) (apiWatch.Interface, error) {
		options.TimeoutSeconds = timeout
		return clientSet.CoreV1().Pods("").Watch(ctx, options)
	}

	watcher, err := watch.NewRetryWatcherWithContext(ctx, resourceVersion, &cache.ListWatch{WatchFuncWithContext: watchFunc})
	if err != nil {
		return nil, fmt.Errorf("failed to create pods watcher: %w", err)
	}

	return watcher, nil
}
