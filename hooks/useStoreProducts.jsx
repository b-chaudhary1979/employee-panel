import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import {
  collection,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

const useStoreProducts = (cid) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch products for the given company id
  const fetchProducts = useCallback(() => {
    if (!cid) return;
    setLoading(true);
    setError(null);
    const productsRef = collection(db, 'users', cid, 'products');
    const unsubscribe = onSnapshot(
      productsRef,
      (querySnapshot) => {
        const prods = [];
        let sNo = 1;
        querySnapshot.forEach((doc) => {
          prods.push({ sNo: sNo++, id: doc.id, ...doc.data() });
        });
        setProducts(prods);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [cid]);

  useEffect(() => {
    const unsubscribe = fetchProducts();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchProducts]);

  // Add a new product
  const addProduct = async (productData) => {
    if (!cid) return;
    setLoading(true);
    setError(null);
    try {
      const productsRef = collection(db, 'users', cid, 'products');
      const prodId = productData.productId;
      
      // Check if product with this ID already exists
      const existingProduct = products.find(product => product.productId === prodId);
      if (existingProduct) {
        throw new Error("Product with this Id already exist");
      }
      
      const dataToSave = {
        ...productData,
        status: productData.status || 'Active',
        dateAdded: serverTimestamp(),
      };
      await setDoc(doc(productsRef, prodId), dataToSave);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err; // Re-throw the error so the form component can catch it
    }
  };

  // Update a product
  const updateProduct = async (id, updatedData) => {
    if (!cid || !id) return;
    setLoading(true);
    setError(null);
    try {
      const prodRef = doc(db, 'users', cid, 'products', id);
      await updateDoc(prodRef, updatedData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Delete a product
  const deleteProduct = async (id) => {
    if (!cid || !id) return;
    setLoading(true);
    setError(null);
    try {
      const prodRef = doc(db, 'users', cid, 'products', id);
      await deleteDoc(prodRef);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    fetchProducts,
  };
};

export default useStoreProducts; 